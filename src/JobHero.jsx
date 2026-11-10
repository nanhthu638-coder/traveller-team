import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react'

const popularSearches = ['Thực tập sinh', 'Marketing', 'Thiết kế']

const revealItem = {
  hidden: { opacity: 0, y: 18 },
  visible: (reduceMotion) => ({
    opacity: 1,
    y: 0,
    transition: { duration: reduceMotion ? 0 : 0.55, ease: 'easeOut' },
  }),
}

function JobHero() {
  const shouldReduceMotion = useReducedMotion()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.12 },
    },
  }

  const showJobs = (event) => {
    event.preventDefault()
    document.getElementById('jobs')?.scrollIntoView({ behavior: shouldReduceMotion ? 'instant' : 'smooth' })
  }

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-decoration" aria-hidden="true" />
      <div className="page-shell hero-layout">
        <motion.div
          className="hero-copy"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="eyebrow" variants={revealItem} custom={shouldReduceMotion}>
            <Sparkles size={15} aria-hidden="true" />
            CƠ HỘI DÀNH RIÊNG CHO BẠN
          </motion.div>

          <motion.h1 id="hero-heading" variants={revealItem} custom={shouldReduceMotion}>
            Khởi đầu sự nghiệp<br />của bạn <span>tại đây.</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={revealItem} custom={shouldReduceMotion}>
            Khám phá công việc phù hợp, kết nối cùng những doanh nghiệp hàng đầu và
            biến điều bạn yêu thích thành sự nghiệp.
          </motion.p>

          <motion.div className="hero-proof" variants={revealItem} custom={shouldReduceMotion}>
            <div className="avatar-stack" aria-hidden="true">
              <span>H</span><span>M</span><span>A</span><span>+</span>
            </div>
            <span><strong>12.000+</strong> sinh viên đã tìm được công việc</span>
          </motion.div>

          <motion.form className="job-search" onSubmit={showJobs} variants={revealItem} custom={shouldReduceMotion}>
            <label className="search-field search-keyword">
              <Search className="search-field-icon" size={20} aria-hidden="true" />
              <span className="search-field-content">
                <span className="search-label">Từ khóa</span>
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Vị trí, công ty..."
                  aria-label="Tìm theo vị trí hoặc công ty"
                />
              </span>
            </label>

            <label className="search-field">
              <BriefcaseBusiness className="search-field-icon" size={19} aria-hidden="true" />
              <span className="search-field-content">
                <span className="search-label">Ngành nghề</span>
                <select aria-label="Chọn ngành nghề" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">Tất cả ngành nghề</option>
                  <option>Công nghệ thông tin</option>
                  <option>Marketing</option>
                  <option>Thiết kế sáng tạo</option>
                  <option>Kinh doanh</option>
                </select>
              </span>
              <ChevronDown className="select-arrow" size={16} aria-hidden="true" />
            </label>

            <label className="search-field">
              <MapPin className="search-field-icon" size={19} aria-hidden="true" />
              <span className="search-field-content">
                <span className="search-label">Địa điểm</span>
                <select aria-label="Chọn địa điểm" value={location} onChange={(event) => setLocation(event.target.value)}>
                  <option value="">Tất cả địa điểm</option>
                  <option>TP. Hồ Chí Minh</option>
                  <option>Hà Nội</option>
                  <option>Đà Nẵng</option>
                  <option>Làm việc từ xa</option>
                </select>
              </span>
              <ChevronDown className="select-arrow" size={16} aria-hidden="true" />
            </label>

            <button className="search-button" type="submit">
              <Search size={18} aria-hidden="true" />
              <span>Tìm việc</span>
            </button>
          </motion.form>

          <motion.div className="popular-searches" variants={revealItem} custom={shouldReduceMotion}>
            <span>Phổ biến:</span>
            {popularSearches.map((search) => (
              <button key={search} type="button" onClick={() => setKeyword(search)}>{search}</button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-art"
          aria-label="Minh họa sinh viên đang tìm kiếm cơ hội việc làm"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: shouldReduceMotion ? 0 : 0.2 }}
        >
          <div className="art-sun" />
          <div className="art-ring" />
          <div className="art-ring art-ring-two" />
          <div className="art-platform" />
          <div className="art-person">
            <div className="person-hair" />
            <div className="person-head" />
            <div className="person-neck" />
            <div className="person-body" />
            <div className="person-arm" />
            <div className="person-arm person-arm-right" />
            <div className="person-leg" />
            <div className="person-leg person-leg-right" />
            <div className="person-shoe" />
            <div className="person-laptop"><span>✓</span></div>
          </div>
          <div className="art-plant" aria-hidden="true"><span /><span /><span /><i /></div>
          <span className="art-spark art-spark-one" aria-hidden="true">✦</span>
          <span className="art-spark art-spark-two" aria-hidden="true">✳</span>

          <motion.div
            className="floating-card floating-card-top"
            aria-label="Hồ sơ nổi bật, nhà tuyển dụng đã xem"
            animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity }}
          >
            <span className="floating-icon"><ShieldCheck size={20} /></span>
            <span><strong>Hồ sơ nổi bật</strong><small>Nhà tuyển dụng đã xem</small></span>
          </motion.div>

          <motion.div
            className="floating-card floating-card-bottom"
            aria-label="Frontend Intern tại Momo, Thành phố Hồ Chí Minh"
            animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, delay: 0.8 }}
          >
            <span className="floating-company">M</span>
            <span><strong>Frontend Intern</strong><small>Momo · TP. Hồ Chí Minh</small></span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </motion.div>
        </motion.div>

        <div className="hero-stats" aria-label="Thống kê StuWork">
          <div>
            <strong>2.500<span>+</span></strong>
            <small>Doanh nghiệp uy tín</small>
          </div>
          <div>
            <strong>18.000<span>+</span></strong>
            <small>Việc làm đang tuyển</small>
          </div>
          <div>
            <strong>95<span>%</span></strong>
            <small>Ứng viên hài lòng</small>
          </div>
          <div className="trusted-by">
            <ShieldCheck size={19} aria-hidden="true" />
            <span>Đồng hành cùng sinh viên Việt</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default JobHero
