import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  Clock3,
  Code2,
  GraduationCap,
  Headset,
  MapPin,
  Megaphone,
  PenTool,
  UsersRound,
} from 'lucide-react'
import JobHero from './JobHero.jsx'
import { jobs } from './jobsData.js'

const categories = [
  { name: 'Công nghệ thông tin', count: '1.240 việc làm', icon: Code2, tone: 'mint' },
  { name: 'Marketing', count: '864 việc làm', icon: Megaphone, tone: 'peach' },
  { name: 'Tài chính — Kế toán', count: '532 việc làm', icon: CircleDollarSign, tone: 'blue' },
  { name: 'Thiết kế sáng tạo', count: '416 việc làm', icon: PenTool, tone: 'lilac' },
  { name: 'Kinh doanh', count: '728 việc làm', icon: ChartNoAxesColumnIncreasing, tone: 'yellow' },
  { name: 'Nhân sự', count: '305 việc làm', icon: UsersRound, tone: 'pink' },
  { name: 'Chăm sóc khách hàng', count: '289 việc làm', icon: Headset, tone: 'aqua' },
  { name: 'Giáo dục', count: '194 việc làm', icon: GraduationCap, tone: 'lavender' },
]

function HomePage({ onViewJob }) {
  return (
    <main id="home">
      <JobHero />

      <section className="section categories-section" id="categories">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <div className="section-kicker">TÌM CƠ HỘI CỦA BẠN</div>
              <h2>Ngành nghề nổi bật</h2>
              <p>Chọn lĩnh vực bạn yêu thích, bắt đầu hành trình của riêng mình.</p>
            </div>
            <span className="text-link">Khám phá tất cả <ArrowRight size={16} /></span>
          </div>
          <div className="category-grid">
            {categories.map(({ name, count, icon: Icon, tone }) => (
              <button className="category-card" key={name} type="button">
                <span className={`category-icon category-${tone}`}><Icon size={22} strokeWidth={1.9} /></span>
                <span className="category-title">{name}</span>
                <span className="category-count">{count}</span>
                <ArrowUpRight className="category-arrow" size={17} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="company-strip" id="companies" aria-label="Doanh nghiệp tuyển dụng nổi bật">
        <div className="page-shell company-strip-inner">
          <span className="company-strip-label">CƠ HỘI TỪ NHỮNG DOANH NGHIỆP HÀNG ĐẦU</span>
          <div className="company-strip-list">
            <span className="company-wordmark wordmark-momo">momo</span>
            <span className="company-wordmark wordmark-shopee">Shopee</span>
            <span className="company-wordmark wordmark-vng">VNG</span>
            <span className="company-wordmark wordmark-fpt">FPT</span>
            <span className="company-wordmark wordmark-tiki">tiki</span>
          </div>
        </div>
      </section>

      <section className="section jobs-section" id="jobs">
        <div className="page-shell">
          <div className="section-heading jobs-heading">
            <div>
              <div className="section-kicker">CƠ HỘI MỚI MỖI NGÀY</div>
              <h2>Việc làm mới nhất</h2>
              <p>Cơ hội tốt đang chờ bạn — ứng tuyển ngay hôm nay.</p>
            </div>
            <span className="text-link">
              Xem tất cả việc làm <ArrowRight size={16} />
            </span>
          </div>
          <div className="jobs-grid">
            {jobs.slice(0,9).map((job) => (
                <article className="job-card" key={job.id}>
                    <div className="job-card-top">
                        <div className={`company-logo logo-${job.tone}`}>{job.logo}</div>
                        <button
                            type="button"
                            className="job-save"
                            aria-label={`Lưu việc làm ${job.title}`}
                            aria-pressed="false"
                        >
                            <Bookmark size={15} />
                        </button>
                    </div>
                    <h3>
                        <button type="button" className="job-title-link" onClick={() => onViewJob(job.id)}>
                            {job.title}
                        </button>
                    </h3>
                    <div className="job-company"><Building2 size={15} />{job.company}<BadgeCheck size={14} className="verified-icon" /></div>
                    <div className="job-tags">
                        <span className="job-tag">{job.type}</span>
                        <span className="job-tag"><MapPin size={12} />{job.location}</span>
                    </div>
                    <div className="job-card-bottom">
                        <div className="job-salary"><strong>{job.salary}</strong><span><Clock3 size={12} />{job.posted}</span></div>
                        <button className="apply-button" type="button" onClick={() => onViewJob(job.id)}>
                            Xem chi tiết <ArrowRight size={14} />
                        </button>
                    </div>
                </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="page-shell cta-inner">
          <div className="cta-decoration">✳</div>
          <div className="cta-icon"><BriefcaseBusiness size={21} /></div>
          <div className="cta-copy">
            <span>BẠN LÀ NHÀ TUYỂN DỤNG?</span>
            <h2>Tìm kiếm những tài năng trẻ đầy nhiệt huyết.</h2>
            <p>Kết nối với hàng ngàn sinh viên sẵn sàng tạo nên khác biệt.</p>
          </div>
          <span className="cta-button">Đăng tin tuyển dụng <ArrowRight size={16} /></span>
        </div>
      </section>
    </main>
  )
}

export default HomePage
