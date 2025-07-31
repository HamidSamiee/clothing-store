import { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  // فقط برای تست یه لیست ساده از محصولات برمی‌گردونیم
  const products = [
    {
        "id": "1",
        "name": "پیراهن مردانه کلاسیک",
        "price": 249000,
        "discount": 15,
        "description": "پیراهن مردانه با جنس کتان مرغوب و دوخت با کیفیت",
        "category": "men",
        "image": "/images/products/shirt1.webp",
        "rating": 4.5,
        "wishlistCount": 5,
        "reviewIds": [
          "rev1",
          "rev2"
        ],
        "questionIds": [
          "q1"
        ],
        "sizes": [
          "S",
          "M",
          "L",
          "XL"
        ],
        "colors": [
          "آبی",
          "سفید",
          "مشکی"
        ],
        "stock": 42,
        "featured": true
      },
      {
        "id": "2",
        "name": "شلوار جین زنانه",
        "price": 189000,
        "description": "شلوار جین اسلیم فیت با کیفیت عالی",
        "category": "women",
        "image": "/images/products/jeans1.webp",
        "rating": 4.2,
        "wishlistCount": 6,
        "reviewIds": [
          "rev1",
          "rev2",
          "rev1753544819962"
        ],
        "questionIds": [
          "q1"
        ],
        "sizes": [
          "36",
          "38",
          "40",
          "42"
        ],
        "colors": [
          "آبی",
          "مشکی"
        ],
        "stock": 25,
        "featured": true
      }
  ];

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};

export { handler };
