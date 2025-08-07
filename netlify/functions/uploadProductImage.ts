import { Handler } from '@netlify/functions';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const handler: Handler = async (event) => {
  try {
    if (!event.body || !event.headers['content-type']) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'بدنه درخواست یا نوع محتوا نامعتبر است' })
      };
    }

    // پارس کردن فرم داده‌های چندقسمتی
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = event.body.split(`--${boundary}`);
    
    let fileData: Buffer | null = null;
    let fileName = '';
    // let contentType = '';

    // استخراج فایل از داده‌های چندقسمتی
    for (const part of parts) {
      if (part.includes('filename="')) {
        const match = part.match(/filename="([^"]+)"/);
        if (match) fileName = match[1];
        
        // const contentTypeMatch = part.match(/Content-Type:\s(.+)\r\n\r\n/);
        // if (contentTypeMatch) contentType = contentTypeMatch[1];
        
        const fileMatch = part.match(/\r\n\r\n(.*)\r\n--$/s);
        if (fileMatch) fileData = Buffer.from(fileMatch[1]);
      }
    }

    if (!fileData || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'فایل تصویر یافت نشد' })
      };
    }

    // ایجاد نام منحصر به فرد برای فایل
    const fileExt = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${fileExt}`;
    
    // مسیر ذخیره‌سازی در پوشه public
    const publicDir = path.join(process.cwd(), 'public', 'images','products');
    const filePath = path.join(publicDir, uniqueFileName);
    const publicUrl = `/products/${uniqueFileName}`;

    // اطمینان از وجود پوشه مقصد
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // ذخیره فایل
    fs.writeFileSync(filePath, fileData);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'تصویر با موفقیت آپلود شد',
        imageUrl: publicUrl
      })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'خطا در آپلود تصویر',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};