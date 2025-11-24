# Social Network Admin Panel

Admin panel để quản lý hệ thống Social Network được xây dựng bằng Next.js 14, TypeScript và Tailwind CSS.

## Tính năng

- ✅ Đăng nhập/Đăng xuất với JWT authentication
- ✅ Quản lý người dùng (xem danh sách, chi tiết)
- ✅ Tìm kiếm người dùng
- ✅ Protected routes (chỉ admin mới truy cập được)
- ✅ Responsive design với Tailwind CSS

## Công nghệ sử dụng

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env.local` (hoặc sao chép từ `.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

3. Chạy development server:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3001](http://localhost:3001)

## Cấu trúc dự án

```
social_admin/
├── app/                    # Next.js App Router
│   ├── login/              # Trang đăng nhập
│   ├── users/              # Quản lý người dùng
│   │   └── [id]/           # Chi tiết user
│   └── page.tsx            # Dashboard
├── components/             # React components
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components
│   ├── users/              # User management components
│   └── ui/                 # Reusable UI components
├── context/                # React Context
│   └── AuthContext.tsx     # Authentication context
├── hooks/                  # Custom hooks
│   └── useAuth.ts
├── lib/                    # Utilities
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth utilities
│   └── types.ts            # TypeScript types
└── package.json
```

## API Endpoints

Ứng dụng kết nối với backend tại `NEXT_PUBLIC_API_URL`:

- `POST /auth/login` - Đăng nhập
- `GET /user` - Lấy danh sách users (ADMIN only)
- `GET /user/:id` - Lấy chi tiết user
- `GET /user/profile` - Lấy profile admin hiện tại
- `GET /user/search` - Tìm kiếm users

## Yêu cầu

- Node.js 18+ 
- Backend đang chạy tại port 3000
- Tài khoản admin để đăng nhập

## Scripts

- `npm run dev` - Chạy development server (port 3001)
- `npm run build` - Build production
- `npm run start` - Chạy production server (port 3001)
- `npm run lint` - Chạy ESLint

## Ghi chú

- Chỉ tài khoản có role `admin` mới có thể đăng nhập vào admin panel
- Token được lưu trong localStorage
- Tự động logout khi token hết hạn hoặc không hợp lệ
