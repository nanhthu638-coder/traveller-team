// Dữ liệu danh mục địa điểm du lịch mặc định (Story: Quản lý danh mục địa điểm)
// Hỗ trợ kiểm tra liên kết với các tour trong hệ thống

export const DEFAULT_DESTINATIONS = [
  {
    id: "ha-long",
    name: "Vịnh Hạ Long",
    region: "Quảng Ninh",
    description: "Kỳ quan thiên nhiên thế giới UNESCO với hàng ngàn đảo đá vôi kỳ vĩ nhô lên từ mặt nước biển xanh biếc tuyệt đẹp và hệ thống hang động tráng lệ.",
    image: "photo-1528127269322-539801943592",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z"
  },
  {
    id: "hoi-an",
    name: "Phố cổ Hội An",
    region: "Quảng Nam",
    description: "Đô thị cổ được bảo tồn trọn vẹn với những ngôi nhà cổ kính sơn vàng đặc trưng, giàn hoa giấy rực rỡ và ánh đèn lồng lung linh huyền ảo bên bờ sông Hoài.",
    image: "photo-1531058020387-3be344556be6",
    createdAt: "2026-10-02T08:00:00.000Z",
    updatedAt: "2026-10-02T08:00:00.000Z"
  },
  {
    id: "ta-xua",
    name: "Tà Xùa",
    region: "Sơn La",
    description: "Thiên đường săn mây bồng bềnh của núi rừng Tây Bắc với sống lưng khủng long hùng vĩ, biển mây cuồn cuộn và không khí trong lành nguyên sơ quanh năm.",
    image: "photo-1470770841072-f978cf4d019e",
    createdAt: "2026-10-03T08:00:00.000Z",
    updatedAt: "2026-10-03T08:00:00.000Z"
  },
  {
    id: "ha-giang",
    name: "Cao nguyên đá Hà Giang",
    region: "Hà Giang",
    description: "Vùng đất địa đầu Tổ quốc nổi danh với hẻm vực Tu Sản sâu nhất Đông Nam Á, đèo Mã Pí Lèng ngoạn mục, dòng sông Nho Quế xanh biếc và mùa hoa tam giác mạch.",
    image: "photo-1519681393784-d120267933ba",
    createdAt: "2026-10-04T08:00:00.000Z",
    updatedAt: "2026-10-04T08:00:00.000Z"
  },
  {
    id: "phu-quoc",
    name: "Đảo ngọc Phú Quốc",
    region: "Kiên Giang",
    description: "Hòn đảo du lịch nghỉ dưỡng hàng đầu với những bờ biển cát mịn trải dài, làn nước trong veo, hoàng hôn rực rỡ và các làng chài ven biển thanh bình.",
    image: "photo-1500375592092-40eb2168fd21",
    createdAt: "2026-10-05T08:00:00.000Z",
    updatedAt: "2026-10-05T08:00:00.000Z"
  },
  {
    id: "da-lat",
    name: "Thành phố Đà Lạt",
    region: "Lâm Đồng",
    description: "Thành phố sương mù mộng mơ xứ ngàn hoa với khí hậu se lạnh quanh năm, rừng thông reo bạt ngàn, hồ Xuân Hương thơ mộng và những quán cà phê lãng mạn.",
    image: "photo-1500530855697-b586d89ba3ee",
    createdAt: "2026-10-06T08:00:00.000Z",
    updatedAt: "2026-10-06T08:00:00.000Z"
  },
  {
    id: "sa-pa",
    name: "Thị xã Sa Pa",
    region: "Lào Cai",
    description: "Thị xã mù sương dưới chân dãy Hoàng Liên Sơn hùng vĩ, nơi hội tụ đỉnh Fansipan nóc nhà Đông Dương, những thửa ruộng bậc thang kỳ vĩ và bản sắc dân tộc độc đáo.",
    image: "photo-1501785888041-af3ef285b470",
    createdAt: "2026-10-07T08:00:00.000Z",
    updatedAt: "2026-10-07T08:00:00.000Z"
  },
  {
    id: "con-dao",
    name: "Quần đảo Côn Đảo",
    region: "Bà Rịa - Vũng Tàu",
    description: "Vùng đất thiêng liêng giàu giá trị lịch sử cách mạng, sở hữu những bãi biển nguyên sơ tuyệt đẹp, hệ sinh thái biển phong phú và không gian thanh tịnh bình yên.",
    image: "photo-1519046904884-53103b34b206",
    createdAt: "2026-10-08T08:00:00.000Z",
    updatedAt: "2026-10-08T08:00:00.000Z"
  },
  {
    id: "hue",
    name: "Cố đô Huế",
    region: "Thừa Thiên Huế",
    description: "Kinh đô xưa của triều đại nhà Nguyễn với quần thể di tích Đại Nội cổ kính, các lăng tẩm uy nghiêm tráng lệ và dòng sông Hương êm đềm trầm mặc.",
    image: "photo-1523906834658-6e24ef2386f9",
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:00:00.000Z"
  },
  {
    id: "nha-trang",
    name: "Vịnh biển Nha Trang",
    region: "Khánh Hòa",
    description: "Thành phố biển sôi động với vịnh biển thuộc top đẹp nhất hành tinh, bãi cát vàng thoai thoải, rạn san hô rực rỡ và nhiều hoạt động thể thao biển hấp dẫn.",
    image: "photo-1544644181-1484b3fdfc62",
    createdAt: "2026-10-10T08:00:00.000Z",
    updatedAt: "2026-10-10T08:00:00.000Z"
  },
  {
    id: "ninh-binh",
    name: "Quần thể Tràng An",
    region: "Ninh Bình",
    description: "Di sản thế giới kép về văn hóa và thiên nhiên với non nước hữu tình, các hang động ngập nước kỳ ảo và những ngôi đền chùa cổ kính trầm mặc soi bóng.",
    image: "photo-1568605117036-5fe5e7bab0b7",
    createdAt: "2026-10-11T08:00:00.000Z",
    updatedAt: "2026-10-11T08:00:00.000Z"
  }
];
