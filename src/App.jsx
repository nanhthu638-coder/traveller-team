import { useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, BriefcaseBusiness, Check, ChevronDown, CircleCheck, ClipboardList, LogOut, Mail, Menu, Phone, UserPen, UserRound, X } from 'lucide-react'
import AuthPage from './AuthPage.jsx'
import ContactForm from './ContactForm.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import HomePage from './HomePage.jsx'
import JobDetail from './JobDetail.jsx'
import ProfilePage from './ProfilePage.jsx'
import { requestApiJson } from './api.js'
import { getJobById } from './jobsData.js'
import SupportDashboard from './SupportDashboard.jsx'
import './App.css'

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => Array.from(part)[0])
    .join('')
    .toLocaleUpperCase('vi')
}

function AccountControls({ user, applicationsVersion, onLogout, onEditProfile, onViewJob, className }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const triggerRef = useRef(null)
  const controlsRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (!controlsRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <div className={`${className} account-menu`} ref={controlsRef}>
      <button
        ref={triggerRef}
        className="account-menu-trigger"
        type="button"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={`Tài khoản của ${user.name}`}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="account-avatar" aria-hidden="true">{getInitials(user.name)}</span>
        <span className="account-name" title={user.name}>{user.name}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {menuOpen && (
        <div className="account-dropdown" id={menuId} role="region" aria-label="Menu tài khoản">
          <AccountOverview user={user} applicationsVersion={applicationsVersion} onViewJob={(jobId) => {
            setMenuOpen(false)
            onViewJob(jobId)
          }} />
          {user.role === 'seeker' && (
            <button
              className="button button-primary account-edit-profile"
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEditProfile()
              }}
            >
              <UserPen size={15} /> Cập nhật hồ sơ &amp; tải CV
            </button>
          )}
          <button
            className="button button-outline account-logout"
            type="button"
            onClick={() => {
              setMenuOpen(false)
              onLogout()
            }}
          >
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function formatApplicationDate(value) {
  const date = new Date(`${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

function AccountOverview({ user, applicationsVersion, onViewJob }) {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    if (user.role !== 'seeker') return undefined
    let cancelled = false
    requestApiJson('/api/applications', { accessToken: user.accessToken })
      .then((result) => { if (!cancelled) setApplications(result.applications) })
      .catch(() => { if (!cancelled) setApplications([]) })
    return () => { cancelled = true }
  }, [user.role, user.accessToken, applicationsVersion])

  return (
    <section className="account-overview" aria-label="Thông tin tài khoản">
      <div className="account-overview-heading">
        <span>TÀI KHOẢN CỦA BẠN</span>
        <h1>Xin chào, {user.name}</h1>
      </div>
      <div className="account-overview-grid">
        <article className="account-card">
          <div className="account-card-heading">
            <span className="account-card-icon"><UserRound size={19} /></span>
            <h2>Hồ sơ cá nhân</h2>
          </div>
          <div className="account-profile">
            <span className="account-avatar account-avatar-large" aria-hidden="true">{getInitials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role === 'support' ? 'Nhân viên hỗ trợ' : 'Thành viên StuWork'}</span>
            </div>
          </div>
          <div className="account-contact"><Mail size={16} /><span>{user.email}</span></div>
          <div className="account-contact"><Phone size={16} /><span>{user.phone}</span></div>
        </article>
        <article className="account-card">
          <div className="account-card-heading">
            <span className="account-card-icon"><ClipboardList size={19} /></span>
            <h2>Lịch sử ứng tuyển</h2>
          </div>
          {applications.length === 0 ? (
            <div className="application-history-empty">
              <BriefcaseBusiness size={24} />
              <p>Bạn chưa có công việc nào được ứng tuyển.</p>
            </div>
          ) : (
            <ul className="application-history-list">
              {applications.map((application) => (
                <li key={application.id}>
                  <button type="button" className="job-title-link" onClick={() => onViewJob(application.jobId)}>
                    {application.title}
                  </button>
                  <span>{application.company} · {formatApplicationDate(application.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}

function App() {
  const [page, setPage] = useState('home')
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [transitionState, setTransitionState] = useState('idle')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [applicationsVersion, setApplicationsVersion] = useState(0)
  const navigationTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(navigationTimer.current), [])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 4500)
  }

  const navigateTo = (nextPage) => {
    if (nextPage === page) return
    window.clearTimeout(navigationTimer.current)
    const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180
    setTransitionState('exiting')
    navigationTimer.current = window.setTimeout(() => {
      setPage(nextPage)
      setTransitionState('entering')
      navigationTimer.current = window.setTimeout(() => setTransitionState('idle'), transitionDuration)
    }, transitionDuration)
  }

  const openAuth = (mode = 'login') => {
    navigateTo(mode)
    setMenuOpen(false)
  }

  const openJob = (jobId) => {
    if (!getJobById(jobId)) {
      showNotice('Không tìm thấy công việc này.')
      return
    }
    setSelectedJobId(jobId)
    navigateTo('job')
    setMenuOpen(false)
  }

  const openProfile = () => {
    if (currentUser?.role !== 'seeker') return
    navigateTo('profile')
    setMenuOpen(false)
  }

  const logoutCurrentUser = async () => {
    try {
      await requestApiJson('/api/auth/session', {
        method: 'DELETE',
        accessToken: currentUser.accessToken,
      })
      showNotice('Bạn đã đăng xuất thành công.')
    } catch (logoutError) {
      showNotice(logoutError.message || 'Không thể xác nhận đăng xuất với máy chủ.')
    } finally {
      setCurrentUser(null)
      setMenuOpen(false)
      if (page === 'support' || page === 'profile') navigateTo('home')
    }
  }

  let pageContent

  if (page === 'login' || page === 'register') {
    pageContent = (
      <AuthPage
        mode={page}
        notice={notice}
        onModeChange={navigateTo}
        onForgotPassword={() => navigateTo('forgot')}
        onBack={() => navigateTo('home')}
        onSuccess={(mode, result) => {
          if (mode === 'register') {
            navigateTo('login')
            showNotice('Tạo tài khoản thành công. Vui lòng đăng nhập bằng tài khoản vừa tạo.')
            return
          }

          setCurrentUser({ ...result.user, accessToken: result.accessToken })
          navigateTo(result.user.role === 'support' ? 'support' : 'home')
          showNotice(`Đăng nhập thành công. Chào mừng ${result.user.name}!`)
        }}
      />
    )
  } else if (page === 'forgot') {
    pageContent = (
      <ForgotPassword
        onBack={() => navigateTo('login')}
        onComplete={(message) => {
          navigateTo('login')
          showNotice(message)
        }}
      />
    )
  } else if (page === 'support' && currentUser?.role === 'support') {
    pageContent = (
      <SupportDashboard
        accessToken={currentUser.accessToken}
        onHome={() => navigateTo('home')}
        onLogout={logoutCurrentUser}
      />
    )
  } else {
    pageContent = (
      <div className="min-h-screen bg-white text-ink">
        <header className="site-header">
          <div className="page-shell header-inner">
            <a
              className="brand"
              href="#home"
              onClick={() => {
                if (page !== 'home') navigateTo('home')
                setMenuOpen(false)
              }}
              aria-label="StuWork - Trang chủ"
            >
              <span className="brand-icon"><BriefcaseBusiness size={21} strokeWidth={2.3} /></span>
              <span>Stu<span>Work</span></span>
            </a>

            <button
              type="button"
              className="mobile-menu-button"
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="Điều hướng chính">
              <a className="nav-active" href="#home" onClick={() => setMenuOpen(false)}>Trang chủ</a>
              <span className="nav-inactive" aria-disabled="true">Việc làm</span>
              <span className="nav-inactive" aria-disabled="true">Công ty</span>
              <a href="#contact" onClick={() => setMenuOpen(false)}>Liên hệ</a>
              {currentUser ? (
                <>
                  <AccountControls
                    className="mobile-nav-actions account-controls"
                    user={currentUser}
                    applicationsVersion={applicationsVersion}
                    onLogout={logoutCurrentUser}
                    onEditProfile={openProfile}
                    onViewJob={openJob}
                  />
                  {currentUser.role === 'support' && (
                    <button className="button button-outline support-nav-button" type="button" onClick={() => navigateTo('support')}>Hộp thư hỗ trợ</button>
                  )}
                </>
              ) : (
                <div className="mobile-nav-actions">
                  <button className="button button-outline" type="button" onClick={() => openAuth('login')}>Đăng nhập</button>
                  <button className="button button-primary" type="button" onClick={() => openAuth('register')}>Đăng ký</button>
                </div>
              )}
            </nav>

            <div className="header-actions">
              {currentUser ? (
                <>
                  <AccountControls
                    className="account-controls"
                    user={currentUser}
                    applicationsVersion={applicationsVersion}
                    onLogout={logoutCurrentUser}
                    onEditProfile={openProfile}
                    onViewJob={openJob}
                  />
                  {currentUser.role === 'support' && (
                    <button className="button button-outline support-nav-button" type="button" onClick={() => navigateTo('support')}>Hộp thư hỗ trợ</button>
                  )}
                </>
              ) : (
                <>
                  <button className="button button-outline" type="button" onClick={() => openAuth('login')}>Đăng nhập</button>
                  <button className="button button-primary" type="button" onClick={() => openAuth('register')}>Đăng ký</button>
                </>
              )}
            </div>
          </div>
        </header>

        {page === 'job' && (
          <JobDetail
            key={`${selectedJobId}-${currentUser?.id ?? 'guest'}`}
            jobId={selectedJobId}
            currentUser={currentUser}
            onBack={() => navigateTo('home')}
            onLogin={() => openAuth('login')}
            onEditProfile={openProfile}
            onNotice={showNotice}
            onApplicationsChanged={() => setApplicationsVersion((version) => version + 1)}
          />
        )}
        {page === 'profile' && currentUser?.role === 'seeker' && (
          <ProfilePage
            accessToken={currentUser.accessToken}
            onBack={() => navigateTo('home')}
            onProfileSaved={(profile) => setCurrentUser((user) => ({ ...user, name: profile.name, phone: profile.phone }))}
            onNotice={showNotice}
          />
        )}
        {page !== 'job' && !(page === 'profile' && currentUser?.role === 'seeker') && <HomePage onViewJob={openJob} />}

        <footer className="site-footer" id="contact">
          <div className="page-shell contact-section">
            <div className="contact-intro">
              <span className="contact-eyebrow">CHÚNG TÔI LUÔN SẴN SÀNG LẮNG NGHE</span>
              <h2>Bạn cần hỗ trợ?</h2>
              <p>Gửi thắc mắc cho đội ngũ StuWork. Chúng tôi sẽ xem xét và phản hồi qua email.</p>
            </div>
            <ContactForm onSubmitted={showNotice} />
          </div>
          <div className="page-shell footer-inner">
            <a className="brand footer-brand" href="#home">
              <span className="brand-icon"><BriefcaseBusiness size={19} /></span>
              <span>Stu<span>Work</span></span>
            </a>
            <p>Tìm đúng cơ hội. Bắt đầu đúng tương lai.</p>
            <a className="footer-link" href="mailto:hello@stuwork.vn">hello@stuwork.vn <ArrowUpRight size={14} /></a>
            <span className="footer-copy">© 2026 StuWork</span>
          </div>
        </footer>

        {notice && (
          <div className="toast" role="status">
            <span className="toast-icon"><CircleCheck size={18} /></span>
            <span>{notice}</span>
            <Check size={16} className="toast-check" aria-hidden="true" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`page-transition page-transition-${transitionState}`} aria-busy={transitionState !== 'idle'}>
      {pageContent}
    </div>
  )
}

export default App
