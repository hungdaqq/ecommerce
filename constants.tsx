
import { Product, BlogPost, UserRole, User } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ghế Công Thái Học ErgoMaster Pro',
    category: 'Ghế',
    price: 8500000,
    description: 'Thiết kế chuẩn công thái học, hỗ trợ cột sống tối đa với đệm thắt lưng 3D điều chỉnh linh hoạt.',
    image: 'https://picsum.photos/seed/ergochair1/600/600',
    stock: 15,
    rating: 4.8,
    reviews: [
      { userId: 'u1', userName: 'Nguyễn Văn A', rating: 5, comment: 'Ghế rất êm, ngồi làm việc cả ngày không mỏi.', date: '2023-10-15' }
    ]
  },
  {
    id: '2',
    name: 'Bàn Đứng Thông Minh FlexiDesk V2',
    category: 'Bàn',
    price: 12500000,
    description: 'Điều chỉnh độ cao bằng điện, có bộ nhớ 4 vị trí, chân thép chắc chắn, tải trọng lên đến 120kg.',
    image: 'https://picsum.photos/seed/ergodesk1/600/600',
    stock: 8,
    rating: 4.9,
    reviews: []
  },
  {
    id: '3',
    name: 'Giá Treo Màn Hình Dual Arm Pro',
    category: 'Phụ kiện',
    price: 1850000,
    description: 'Nâng hạ linh hoạt cho 2 màn hình, giúp giải phóng không gian bàn làm việc và bảo vệ cổ vai gáy.',
    image: 'https://picsum.photos/seed/ergomonitor/600/600',
    stock: 25,
    rating: 4.5,
    reviews: []
  },
  {
    id: '4',
    name: 'Bàn Phím Cơ Công Thái Học Split-K',
    category: 'Phụ kiện',
    price: 3200000,
    description: 'Thiết kế tách rời giúp cổ tay ở tư thế tự nhiên nhất, giảm thiểu hội chứng ống cổ tay.',
    image: 'https://picsum.photos/seed/ergokeyboard/600/600',
    stock: 10,
    rating: 4.7,
    reviews: []
  },
  {
    id: '5',
    name: 'Chuột Vertical Ergo Mouse',
    category: 'Phụ kiện',
    price: 950000,
    description: 'Thiết kế dạng đứng 57 độ, giúp giảm áp lực cổ tay khi sử dụng thời gian dài.',
    image: 'https://picsum.photos/seed/ergomouse/600/600',
    stock: 30,
    rating: 4.6,
    reviews: []
  }
];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: '5 Lợi ích của Ghế Công Thái Học đối với sức khỏe',
    excerpt: 'Tại sao bạn cần đầu tư một chiếc ghế tốt ngay hôm nay?',
    content: 'Ghế công thái học không chỉ là một món đồ nội thất, nó là khoản đầu tư cho sức khỏe lâu dài...',
    author: 'Admin Ergolife',
    date: '2023-11-20',
    image: 'https://picsum.photos/seed/blog1/800/400'
  },
  {
    id: 'b2',
    title: 'Cách thiết lập góc làm việc chuẩn công thái học',
    excerpt: 'Hướng dẫn chi tiết từng bước để có một setup hoàn hảo.',
    content: 'Bắt đầu từ độ cao của bàn, vị trí màn hình đến cách đặt bàn chân...',
    author: 'Nhân viên Support',
    date: '2023-11-25',
    image: 'https://picsum.photos/seed/blog2/800/400'
  }
];

export const TEST_USERS: User[] = [
  { id: '1', name: 'Khách hàng Demo', email: 'user@ergolife.com', role: UserRole.USER, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Nhân viên Demo', email: 'staff@ergolife.com', role: UserRole.STAFF, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Admin Ergolife', email: 'admin@ergolife.com', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?u=3' },
];
