import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { dbConnect } from "@/service/mongo";
import Order from "@/model/Order";
import Product from "@/model/product-model";
import jsPDF from 'jspdf';
import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();
    const { items, deliveryAddress, deliveryDate, deliveryTime, paymentMethod, total } = data;

    await dbConnect();

    // Check stock and reduce
    for (const item of items) {
        const product = await Product.findById(item.product._id);
        if (product.stock < item.quantity) {
            return Response.json({ error: `Insufficient stock for ${product.productName}` }, { status: 400 });
        }
        product.stock -= item.quantity;
        product.salesCount += item.quantity;
        await product.save();
    }

    const order = new Order({
        user: session.user.id,
        items: items.map(item => ({ product: item.product._id, quantity: item.quantity, price: item.product.price })),
        total,
        deliveryAddress,
        deliveryDate,
        deliveryTime,
        paymentMethod,
        transactionId: `TXN-FB-${Date.now()}`,
    });
    await order.save();

    // Generate PDF
    const doc = new jsPDF();
    doc.text('FarmFresh Invoice', 10, 10);
    doc.text(`Order #${order._id}`, 10, 20);
    doc.text(`Customer: ${session.user.name}`, 10, 30);
    doc.text(`Email: ${session.user.email}`, 10, 40);
    doc.text(`Delivery Address: ${deliveryAddress}`, 10, 50);
    doc.text(`Delivery Date: ${new Date(deliveryDate).toLocaleDateString()}`, 10, 60);
    doc.text(`Delivery Time: ${deliveryTime}`, 10, 70);
    doc.text('Items:', 10, 80);
    let y = 90;
    items.forEach((item, i) => {
        doc.text(`${i + 1}. ${item.product.productName} - Qty: ${item.quantity} - Price: ৳${item.product.price * item.quantity}`, 10, y);
        y += 10;
    });
    doc.text(`Total: ৳${total}`, 10, y);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Send email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: `"FarmFresh" <${process.env.GMAIL_USER}>`,
        to: session.user.email,
        subject: 'Your FarmFresh Order Invoice',
        text: 'Attached is your invoice.',
        attachments: [{ filename: 'invoice.pdf', content: pdfBuffer }],
    });

    return Response.json({ orderId: order._id });
}

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    let orders;
    if (session.user.userType === 'customer') {
        orders = await Order.find({ user: session.user.id }).populate('items.product');
    } else { // farmer
        orders = await Order.find({ 'items.product.farmer': session.user.id }).populate('items.product').populate('user');
    }
    return Response.json(orders);
}
