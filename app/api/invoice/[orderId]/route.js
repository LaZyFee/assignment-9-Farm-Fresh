import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import Order from "@/model/Order";
import jsPDF from 'jspdf';
import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await dbConnect();

        const order = await Order.findById(params.orderId)
            .populate('items.product')
            .populate('user', 'firstName lastName email phone');

        if (!order) {
            return new NextResponse('Order not found', { status: 404 });
        }

        // Authorization check
        const isCustomerOrder = order.user._id.toString() === session.user.id;
        const isFarmerOrder = session.user.userType === 'farmer' &&
            order.items.some(item => item.product.farmer?.toString() === session.user.id);

        if (!isCustomerOrder && !isFarmerOrder) {
            return new NextResponse('Access denied', { status: 403 });
        }

        // Try to serve existing PDF file first
        const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
        const filename = `invoice-${order._id}.pdf`;
        const filepath = path.join(invoicesDir, filename);

        try {
            const existingPDF = await fs.readFile(filepath);
            // console.log(`Serving existing PDF: ${filename}`);

            return new NextResponse(existingPDF, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="FarmFresh-Invoice-${order._id}.pdf"`,
                    'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
                },
            });
        } catch (fileError) {
            console.log(`PDF file not found, generating new one: ${filename}`);
        }

        // Generate PDF if not found
        const pdfBuffer = await generateInvoicePDF(order);

        // Store the PDF for future requests
        try {
            await fs.mkdir(invoicesDir, { recursive: true });
            await fs.writeFile(filepath, pdfBuffer);
            // console.log(`PDF generated and stored: ${filename}`);
        } catch (storageError) {
            console.error("Failed to store PDF:", storageError);
            // Continue anyway - serving the PDF is more important
        }

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="FarmFresh-Invoice-${order._id}.pdf"`,
                'Cache-Control': 'public, max-age=3600'
            },
        });

    } catch (error) {
        console.error("Invoice generation error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

async function generateInvoicePDF(order) {
    try {
        const doc = new jsPDF();
        const user = order.user;

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
        doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, 20, 80);

        // Customer Information
        doc.setFontSize(14);
        doc.text('Customer Information', 20, 100);
        doc.setFontSize(11);
        doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 115);
        doc.text(`Email: ${user.email}`, 20, 125);
        doc.text(`Phone: ${user.phone || 'Not provided'}`, 20, 135);

        // Delivery Information
        doc.setFontSize(14);
        doc.text('Delivery Information', 20, 155);
        doc.setFontSize(11);
        const deliveryAddress = order.deliveryAddress.length > 60
            ? order.deliveryAddress.substring(0, 60) + '...'
            : order.deliveryAddress;
        doc.text(`Address: ${deliveryAddress}`, 20, 170);
        doc.text(`Date: ${new Date(order.deliveryDate).toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka' })}`, 20, 180);
        doc.text(`Time: ${order.deliveryTime}`, 20, 190);

        // Items table header
        doc.setFontSize(14);
        doc.text('Order Items', 20, 210);

        // Table headers
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Item', 20, 225);
        doc.text('Qty', 100, 225);
        doc.text('Unit Price', 130, 225);
        doc.text('Total', 170, 225);

        // Draw line under headers
        doc.line(20, 227, 190, 227);

        // Reset font
        doc.setFont(undefined, 'normal');

        let yPos = 235;
        order.items.forEach((item, index) => {
            if (yPos > 270) { // Add new page if needed
                doc.addPage();
                yPos = 30;
                // Redraw headers on new page
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text('Item', 20, yPos - 10);
                doc.text('Qty', 100, yPos - 10);
                doc.text('Unit Price', 130, yPos - 10);
                doc.text('Total', 170, yPos - 10);
                doc.line(20, yPos - 8, 190, yPos - 8);
                doc.setFont(undefined, 'normal');
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
        if (yPos > 250) {
            doc.addPage();
            yPos = 30;
        }

        doc.line(130, yPos, 190, yPos); // Line above summary
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

        // Add page number if multiple pages
        const pageCount = doc.internal.getNumberOfPages();
        if (pageCount > 1) {
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Page ${i} of ${pageCount}`, 170, 285);
            }
        }

        // Convert to buffer
        const pdfArrayBuffer = doc.output('arraybuffer');
        return Buffer.from(pdfArrayBuffer);

    } catch (error) {
        console.error("PDF generation error:", error);
        throw new Error("Failed to generate PDF invoice");
    }
}