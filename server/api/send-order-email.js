import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { telegramNickname, phoneNumber, email, cart, totalPrice, orderDate } = body;
    
    // Create a formatted order summary for the email
    const orderItems = cart.map(item => 
      `${item.title}: ${item.price} руб.${item.url ? '\nURL: ' + item.url : ''}`
    ).join('\n\n');
    
    const orderSummary = `
      Новый заказ!
      Дата заказа: ${new Date(orderDate).toLocaleString('ru-RU')}
      
      Контактные данные:
      Telegram: ${telegramNickname || 'Не указан'}
      Телефон: ${phoneNumber || 'Не указан'}
      Email: ${email || 'Не указан'}
      
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
      from: '"odet_nadezhdu web" <nirahk@ya.ru>',
      to: 'bcoziworthit@gmail.com', 
      // to: 'alexander.kharin@gmail.com', 
      cc: 'alexander.kharin@gmail.com',
      subject: `Новый заказ с сайта odetnadezhdu.ru`,
      text: orderSummary,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
});