import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import Order from "@/model/Order";
import Product from "@/model/product-model";
import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';
import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized. Please log in to continue." }, { status: 401 });
        }

        const data = await request.json();
        const {
            items,
            deliveryAddress,
            deliveryDate,
            deliveryTime,
            paymentMethod,
            total,
            subtotal,
            deliveryFee,
            serviceFee
        } = data;

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No items in cart" }, { status: 400 });
        }

        if (!deliveryAddress || deliveryAddress.trim() === "" || deliveryAddress === "Please enter your address") {
            return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
        }

        if (!deliveryDate || !deliveryTime) {
            return NextResponse.json({ error: "Delivery date and time are required" }, { status: 400 });
        }

        if (!paymentMethod) {
            return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
        }

        if (!total || total <= 0) {
            return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
        }

        await dbConnect();

        // Check stock and validate products
        const stockErrors = [];
        const validatedItems = [];

        for (const item of items) {
            // Handle both productId and product._id structures
            const productId = item.productId || (item.product?._id);

            if (!productId) {
                return NextResponse.json({ error: "Invalid product information" }, { status: 400 });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.productName || 'Unknown'}` }, { status: 404 });
            }

            if (product.stock < item.quantity) {
                stockErrors.push(`${product.productName} - Available: ${product.stock} ${product.unit}, Requested: ${item.quantity} ${product.unit}`);
                continue;
            }

            validatedItems.push({
                product: product,
                quantity: item.quantity,
                price: item.price || product.price
            });
        }

        if (stockErrors.length > 0) {
            return NextResponse.json({
                error: `Insufficient stock for the following items:\n${stockErrors.join('\n')}`,
                type: "stock_error"
            }, { status: 400 });
        }

        // Start transaction-like operation
        const updatedProducts = [];
        try {
            // Update stock for all products
            for (const { product, quantity } of validatedItems) {
                product.stock -= quantity;
                product.salesCount = (product.salesCount || 0) + quantity;
                await product.save();
                updatedProducts.push({ product, originalQuantity: quantity });
            }

            // Create order
            const order = new Order({
                user: session.user.id,
                items: validatedItems.map(({ product, quantity, price }) => ({
                    product: product._id,
                    quantity: quantity,
                    price: price,
                })),
                total,
                subtotal: subtotal || validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                deliveryFee: deliveryFee || 50,
                serviceFee: serviceFee || 25,
                deliveryAddress: deliveryAddress.trim(),
                deliveryDate: new Date(deliveryDate),
                deliveryTime,
                paymentMethod,
                transactionId: `TXN-FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            });

            await order.save();

            // Generate and store PDF, then send email
            try {
                const pdfBuffer = await generateInvoicePDF(order, session.user, validatedItems);

                // Store PDF file (optional - for persistent access)
                await storePDFFile(order._id.toString(), pdfBuffer);

                // Send email with PDF attachment
                await sendOrderConfirmationEmail(order, session.user, pdfBuffer);

                console.log(`Order ${order._id} processed successfully with PDF generated and email sent`);
            } catch (emailError) {
                console.error("PDF generation or email sending failed:", emailError);
                // Don't fail the order if PDF/email fails - this is non-critical
            }

            return NextResponse.json({
                orderId: order._id,
                message: "Order placed successfully",
                hasPDF: true // Indicate PDF is available
            });

        } catch (saveError) {
            // Rollback stock changes if order creation fails
            console.error("Order creation failed, rolling back stock changes:", saveError);

            for (const { product, originalQuantity } of updatedProducts) {
                try {
                    product.stock += originalQuantity;
                    product.salesCount = Math.max(0, (product.salesCount || 0) - originalQuantity);
                    await product.save();
                } catch (rollbackError) {
                    console.error("Stock rollback failed for product:", product._id, rollbackError);
                }
            }

            throw saveError;
        }

    } catch (error) {
        console.error("Order processing error:", error);

        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: "Invalid order data. Please check your information and try again.",
                type: "validation_error"
            }, { status: 400 });
        }

        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            return NextResponse.json({
                error: "Database error. Please try again later.",
                type: "server_error"
            }, { status: 500 });
        }

        return NextResponse.json({
            error: "An unexpected error occurred. Please try again.",
            type: "server_error"
        }, { status: 500 });
    }
}

async function generateInvoicePDF(order, user, items) {
    try {
        const doc = new jsPDF();

        // Header with better styling
        doc.setFontSize(24);
        doc.setTextColor(0, 128, 0); // Green color
        doc.text('FarmFresh Invoice', 20, 30);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100); // Gray color
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-BD', {
            timeZone: 'Asia/Dhaka',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`, 150, 30);

        // Reset to black for main content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);

        // Order Information
        doc.text(`Order ID: ${order._id}`, 20, 50);
        doc.text(`Transaction ID: ${order.transactionId}`, 20, 60);
        doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' })}`, 20, 70);

        // Customer Information
        doc.setFontSize(14);
        doc.text('Customer Information', 20, 90);
        doc.setFontSize(11);
        doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 105);
        doc.text(`Email: ${user.email}`, 20, 115);
        doc.text(`Phone: ${user.phone || 'Not provided'}`, 20, 125);

        // Delivery Information
        doc.setFontSize(14);
        doc.text('Delivery Information', 20, 145);
        doc.setFontSize(11);
        doc.text(`Address: ${order.deliveryAddress}`, 20, 160);
        doc.text(`Date: ${new Date(order.deliveryDate).toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' })}`, 20, 170);
        doc.text(`Time: ${order.deliveryTime}`, 20, 180);

        // Items table header
        doc.setFontSize(14);
        doc.text('Order Items', 20, 200);

        // Table headers
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Item', 20, 215);
        doc.text('Qty', 100, 215);
        doc.text('Unit Price', 130, 215);
        doc.text('Total', 170, 215);

        // Draw line under headers
        doc.line(20, 217, 190, 217);

        // Reset font
        doc.setFont(undefined, 'normal');

        let yPos = 225;
        items.forEach((item, index) => {
            if (yPos > 270) { // Add new page if needed
                doc.addPage();
                yPos = 30;
            }

            const itemName = item.product.productName.length > 25
                ? item.product.productName.substring(0, 25) + '...'
                : item.product.productName;

            doc.text(itemName, 20, yPos);
            doc.text(`${item.quantity} ${item.product.unit}`, 100, yPos);
            doc.text(`৳${item.price}`, 130, yPos);
            doc.text(`৳${(item.price * item.quantity).toFixed(2)}`, 170, yPos);
            yPos += 10;
        });

        // Summary section
        yPos += 10;
        doc.line(20, yPos, 190, yPos); // Line above summary
        yPos += 10;

        doc.text(`Subtotal: ৳${order.subtotal.toFixed(2)}`, 130, yPos);
        yPos += 10;
        doc.text(`Delivery Fee: ৳${order.deliveryFee.toFixed(2)}`, 130, yPos);
        yPos += 10;
        doc.text(`Service Fee: ৳${order.serviceFee.toFixed(2)}`, 130, yPos);
        yPos += 10;

        // Total with emphasis
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text(`Total Amount: ৳${order.total.toFixed(2)}`, 130, yPos);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);

        yPos += 15;
        doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 20, yPos);

        // Footer
        yPos += 20;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for choosing FarmFresh! For any queries, contact us at support@farmfresh.com', 20, yPos);

        // Convert to buffer for storage and email
        const pdfArrayBuffer = doc.output('arraybuffer');
        return Buffer.from(pdfArrayBuffer);

    } catch (error) {
        console.error("PDF generation error:", error);
        throw new Error("Failed to generate PDF invoice");
    }
}

async function storePDFFile(orderId, pdfBuffer) {
    try {
        // Create invoices directory if it doesn't exist
        const invoicesDir = path.join(process.cwd(), 'public', 'invoices');

        try {
            await fs.access(invoicesDir);
        } catch {
            await fs.mkdir(invoicesDir, { recursive: true });
        }

        // Save PDF file
        const filename = `invoice-${orderId}.pdf`;
        const filepath = path.join(invoicesDir, filename);

        await fs.writeFile(filepath, pdfBuffer);
        console.log(`PDF stored successfully: ${filename}`);

        return `/invoices/${filename}`;
    } catch (error) {
        console.error("PDF storage error:", error);
        // Don't throw - storage is optional
        return null;
    }
}



async function sendOrderConfirmationEmail(order, user, pdfBuffer) {
    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.warn("Gmail credentials not configured, skipping email");
            return;
        }

        // Create the transporter using nodemailer.createTransport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // Verify transporter configuration
        await transporter.verify();

        const mailOptions = {
            from: `"FarmFresh" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: `Order Confirmation - FarmFresh Order #${order._id}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2d5a27; color: white; padding: 20px; text-align: center;">
            <h1>Order Confirmation</h1>
            <p>Thank you for choosing FarmFresh!</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h2 style="color: #2d5a27;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Order ID:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${order._id}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">৳${order.total}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Delivery Date:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(order.deliveryDate).toLocaleDateString('en-BD')}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Delivery Time:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${order.deliveryTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Payment Method:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${order.paymentMethod.toUpperCase()}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-left: 4px solid #2d5a27;">
              <h3 style="margin: 0; color: #2d5a27;">What's Next?</h3>
              <ul style="margin: 10px 0;">
                <li>We'll prepare your fresh produce with care</li>
                <li>You'll receive updates about your order status</li>
                <li>Our delivery team will contact you before delivery</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;">
              Your detailed invoice is attached to this email. If you have any questions, 
              please don't hesitate to contact us at <a href="mailto:support@farmfresh.com">support@farmfresh.com</a>.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666;">Thank you for supporting local farmers!</p>
              <p style="color: #666; font-size: 12px;">FarmFresh - Farm to Your Table</p>
            </div>
          </div>
        </div>
      `,
            attachments: [
                {
                    filename: `FarmFresh-Invoice-${order._id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent successfully to ${user.email}:`, result.messageId);
    } catch (error) {
        console.error("Email sending error:", error);
        throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
}
export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        let orders;
        if (session.user.userType === 'customer') {
            orders = await Order.find({ user: session.user.id })
                .populate('items.product')
                .sort({ createdAt: -1 });
        } else if (session.user.userType === 'farmer') {
            // For farmers, find orders containing their products
            const products = await Product.find({ farmer: session.user.id }).select('_id');
            const productIds = products.map(p => p._id);

            orders = await Order.find({ 'items.product': { $in: productIds } })
                .populate('items.product')
                .populate('user', 'firstName lastName email phone')
                .sort({ createdAt: -1 });
        } else {
            return NextResponse.json({ error: "Invalid user type" }, { status: 403 });
        }

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Orders fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}