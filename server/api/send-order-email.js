import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, userName, cart, totalPrice, orderDate } = body;
    
    // Create a formatted order summary for the email
    const orderItems = cart.map(item => 
      `${item.title}: ${item.price} руб.`
    ).join('\n');
    
    const orderSummary = `
      Новый заказ от пользователя: ${userName || 'Неизвестно'} (${userId || 'ID не указан'})
      Дата заказа: ${new Date(orderDate).toLocaleString('ru-RU')}
      
      Товары:
      ${orderItems}
      
      Итого: ${totalPrice} руб.
    `;
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com', // Replace with your SMTP server
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: '8d8bd4001@smtp-brevo.com', // Replace with your email
        pass: 'v0jbXcIk8GBU174R', // Replace with your password or app-specific password
      },
    });
    
    // Send email
    const info = await transporter.sendMail({
      from: '"odet_nadezhdu" <nirahk@ya.ru>',
      to: 'alexander.kharin@gmail.com', // Replace with admin's email
      subject: `Новый заказ от ${userName || userId || 'пользователя'}`,
      text: orderSummary,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
});