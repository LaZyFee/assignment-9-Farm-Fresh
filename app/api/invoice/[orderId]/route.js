import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { dbConnect } from "@/service/mongo";
import Order from "@/model/Order";
import jsPDF from 'jspdf';

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new Response('Unauthorized', { status: 401 });
    }
    await dbConnect();
    const order = await Order.findById(params.orderId).populate('items.product').populate('user');
    if (!order || order.user.toString() !== session.user.id) {
        return new Response('Not found', { status: 404 });
    }

    const doc = new jsPDF();
    // Same as above PDF generation
    doc.text('FarmFresh Invoice', 10, 10);
    doc.text(`Order #${order._id}`, 10, 20);
    doc.text(`Customer: ${order.user.firstName} ${order.user.lastName}`, 10, 30);
    doc.text(`Email: ${order.user.email}`, 10, 40);
    doc.text(`Delivery Address: ${order.deliveryAddress}`, 10, 50);
    doc.text(`Delivery Date: ${order.deliveryDate.toLocaleDateString()}`, 10, 60);
    doc.text(`Delivery Time: ${order.deliveryTime}`, 10, 70);
    doc.text('Items:', 10, 80);
    let y = 90;
    order.items.forEach((item, i) => {
        doc.text(`${i + 1}. ${item.product.productName} - Qty: ${item.quantity} - Price: ৳${item.price * item.quantity}`, 10, y);
        y += 10;
    });
    doc.text(`Total: ৳${order.total}`, 10, y);

    const pdfOutput = doc.output();
    return new Response(pdfOutput, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice_${order._id}.pdf`,
        },
    });
}