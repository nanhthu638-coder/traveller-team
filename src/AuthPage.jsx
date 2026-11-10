import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Hand,
  LockKeyhole,
  Mail,
  MapPin,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { postApiJson } from './api.js'

export function HoldToReveal({ revealed, onRevealChange, inputId }) {
  return (
    <button
      className={`hold-reveal${revealed ? ' hold-reveal-active' : ''}`}
      type="button"
      aria-label={revealed ? 'Thả để ẩn mật khẩu' : 'Nhấn giữ để xem mật khẩu'}
      aria-controls={inputId}
      onPointerDown={(event) => {
        event.preventDefault()
        onRevealChange(true)
      }}
      onPointerUp={() => onRevealChange(false)}
      onPointerLeave={() => onRevealChange(false)}
      onPointerCancel={() => onRevealChange(false)}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          onRevealChange(true)
        }
      }}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') onRevealChange(false)
      }}
      onBlur={() => onRevealChange(false)}
    >
      <Hand size={16} />
      <span>{revealed ? 'Đang hiện' : 'Giữ để xem'}</span>
    </button>
  )
}

function AuthPage({ mode, notice, onModeChange, onForgotPassword, onBack, onSuccess }) {
  const isRegister = mode === 'register'
  const [passwordRevealed, setPasswordRevealed] = useState(false)
  const [confirmationRevealed, setConfirmationRevealed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm({ shouldUnregister: true })
  const phoneField = isRegister
    ? register('phone', {
      required: 'Vui lòng nhập số điện thoại.',
      validate: (value) => /^\d{8,10}$/.test(value) || 'Số điện thoại chưa hợp lệ.',
    })
    : null

  const onSubmit = async (values) => {
    setError('')
    setSubmitting(true)
    try {
      const result = await postApiJson(
        isRegister ? 'register' : 'login',
        isRegister
          ? {
            name: values.name.trim(),
            email: values.email.trim(),
            phone: `+84${values.phone.trim().replace(/^0/, '')}`,
            password: values.password,
          }
          : { identifier: values.identifier.trim(), password: values.password },
      )
      if (isRegister) reset()
      const user = result?.user
      if (!isRegister && (
        !user
        || ['name', 'email', 'phone', 'role'].some((field) => typeof user[field] !== 'string')
        || !['seeker', 'support'].includes(user.role)
        || typeof result.accessToken !== 'string'
        || !result.accessToken
      )) {
        throw new Error('Máy chủ chưa trả về thông tin tài khoản. Vui lòng khởi động lại ứng dụng bằng lệnh npm run dev.')
      }
      onSuccess(isRegister ? 'register' : 'login', result)
    } catch (submitError) {
      setError(submitError.message || 'Không thể kết nối máy chủ. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setError('')
    setPasswordRevealed(false)
    setConfirmationRevealed(false)
    onModeChange(isRegister ? 'login' : 'register')
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <button className="auth-back auth-back-light" type="button" onClick={onBack}>
            <ArrowLeft size={17} /> Về trang chủ
          </button>
          <a className="brand auth-brand" href="/" onClick={(event) => { event.preventDefault(); onBack() }}>
            <span className="brand-icon"><BriefcaseBusiness size={20} /></span>
            <span>Stu<span>Work</span></span>
          </a>
          <div className="auth-art">
            <div className="auth-art-orbit auth-art-orbit-one" />
            <div className="auth-art-orbit auth-art-orbit-two" />
            <div className="auth-art-blob" />
            <div className="auth-art-person">
              <div className="auth-art-hair" />
              <div className="auth-art-face" />
              <div className="auth-art-neck" />
              <div className="auth-art-shirt" />
              <div className="auth-art-arm" />
              <div className="auth-art-tablet"><span><Check size={19} /></span></div>
            </div>
            <div className="auth-art-card auth-art-card-one">
              <span><Sparkles size={18} /></span>
              <div><strong>Cơ hội của bạn</strong><small>Đang ở ngay phía trước</small></div>
            </div>
            <div className="auth-art-card auth-art-card-two">
              <span><BadgeCheck size={18} /></span>
              <div><strong>Hồ sơ đã sẵn sàng</strong><small>Nhà tuyển dụng đang tìm bạn</small></div>
            </div>
            <div className="auth-art-spark">✳</div>
          </div>
          <div className="auth-visual-caption">
            <div className="auth-caption-kicker">BƯỚC ĐỆM CHO TƯƠNG LAI</div>
            <h1>Mỗi hành trình<br />lớn đều bắt đầu từ<br /><span>một cơ hội.</span></h1>
            <p>Cùng StuWork khám phá công việc phù hợp và viết nên câu chuyện nghề nghiệp của bạn.</p>
          </div>
          <div className="auth-visual-foot"><MapPin size={14} /> Kết nối tài năng trẻ trên khắp Việt Nam</div>
        </div>
      </section>

      <section className="auth-form-panel">
        <button className="auth-back auth-back-mobile" type="button" onClick={onBack}>
          <ArrowLeft size={17} /> Về trang chủ
        </button>
        <div className="auth-form-wrap">
          <div className="auth-form-topline"><span>{isRegister ? 'TẠO TÀI KHOẢN' : 'CHÀO MỪNG TRỞ LẠI'}</span><span className="auth-step"><i /> An toàn & bảo mật</span></div>
          <div className="auth-heading">
            <h2>{isRegister ? 'Bắt đầu hành trình mới.' : 'Rất vui được gặp lại bạn.'}</h2>
            <p>{isRegister ? 'Tạo tài khoản StuWork để khám phá cơ hội phù hợp.' : 'Đăng nhập để tiếp tục hành trình tìm việc của bạn.'}</p>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Chọn loại tài khoản">
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'auth-tab-active' : ''} onClick={() => { if (isRegister) switchMode() }}>Đăng nhập</button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'auth-tab-active' : ''} onClick={() => { if (!isRegister) switchMode() }}>Đăng ký</button>
          </div>

          {notice && <div className="form-api-success" role="status">{notice}</div>}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {isRegister ? (
              <>
                <label className="form-label" htmlFor="name">Họ và tên</label>
                <div className={`form-control${errors.name ? ' form-control-invalid' : ''}`}>
                  <UserRound size={18} />
                  <input id="name" autoComplete="name" placeholder="Nguyễn Minh Anh" {...register('name', { required: 'Vui lòng nhập họ và tên.', minLength: { value: 2, message: 'Họ tên cần có ít nhất 2 ký tự.' } })} />
                </div>
                {errors.name && <span className="field-error">{errors.name.message}</span>}
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="email">Email</label>
                    <div className={`form-control${errors.email ? ' form-control-invalid' : ''}`}>
                      <Mail size={18} />
                      <input id="email" type="email" autoComplete="email" placeholder="ban@email.com" {...register('email', { required: 'Vui lòng nhập email.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email chưa đúng định dạng.' } })} />
                    </div>
                    {errors.email && <span className="field-error">{errors.email.message}</span>}
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="phone">Số điện thoại</label>
                    <div className={`form-control${errors.phone ? ' form-control-invalid' : ''}`}>
                      <span className="country-code">+84</span>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="912 345 678"
                        {...phoneField}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, '')
                          const localNumber = digits.startsWith('84')
                            ? digits.slice(2)
                            : digits.startsWith('0') ? digits.slice(1) : digits
                          event.target.value = localNumber.slice(0, 10)
                          phoneField.onChange(event)
                        }}
                      />
                    </div>
                    {errors.phone && <span className="field-error">{errors.phone.message}</span>}
                  </div>
                </div>
                <label className="form-label" htmlFor="password">Mật khẩu</label>
                <div className={`form-control form-control-password${errors.password ? ' form-control-invalid' : ''}`}>
                  <LockKeyhole size={18} />
                  <input id="password" type={passwordRevealed ? 'text' : 'password'} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" {...register('password', { required: 'Vui lòng nhập mật khẩu.', minLength: { value: 8, message: 'Mật khẩu cần có ít nhất 8 ký tự.' }, deps: 'confirmPassword' })} />
                  <HoldToReveal inputId="password" revealed={passwordRevealed} onRevealChange={setPasswordRevealed} />
                </div>
                {errors.password && <span className="field-error">{errors.password.message}</span>}
                <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <div className={`form-control form-control-password${errors.confirmPassword ? ' form-control-invalid' : ''}`}>
                  <LockKeyhole size={18} />
                  <input id="confirmPassword" type={confirmationRevealed ? 'text' : 'password'} autoComplete="new-password" placeholder="Nhập lại mật khẩu" {...register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu.', validate: (value) => value === getValues('password') || 'Mật khẩu xác nhận chưa khớp.' })} />
                  <HoldToReveal inputId="confirmPassword" revealed={confirmationRevealed} onRevealChange={setConfirmationRevealed} />
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
              </>
            ) : (
              <>
                <label className="form-label" htmlFor="identifier">Email hoặc số điện thoại</label>
                <div className={`form-control${errors.identifier ? ' form-control-invalid' : ''}`}>
                  <Mail size={18} />
                  <input id="identifier" autoComplete="username" placeholder="ban@email.com hoặc 0912 345 678" {...register('identifier', { required: 'Vui lòng nhập email hoặc số điện thoại.' })} />
                </div>
                {errors.identifier && <span className="field-error">{errors.identifier.message}</span>}
                <div className="form-label-row">
                  <label className="form-label" htmlFor="password">Mật khẩu</label>
                  <button className="forgot-link" type="button" onClick={onForgotPassword}>Quên mật khẩu?</button>
                </div>
                <div className={`form-control form-control-password${errors.password ? ' form-control-invalid' : ''}`}>
                  <LockKeyhole size={18} />
                  <input id="password" type={passwordRevealed ? 'text' : 'password'} autoComplete="current-password" placeholder="Nhập mật khẩu của bạn" {...register('password', { required: 'Vui lòng nhập mật khẩu.' })} />
                  <HoldToReveal inputId="password" revealed={passwordRevealed} onRevealChange={setPasswordRevealed} />
                </div>
                {errors.password && <span className="field-error">{errors.password.message}</span>}
              </>
            )}
            {error && <div className="form-api-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}{!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-separator"><span>HOẶC TIẾP TỤC VỚI</span></div>
          <button className="social-button" type="button">
            <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" /><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4h-6.8v5.3A20 20 0 0 0 24 44Z" /><path fill="#4A90E2" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 17.9l6.8-5.2Z" /><path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3C14.2 15.7 18.7 12.1 24 12.1Z" /></svg>
            Tiếp tục với Google
          </button>

          <p className="auth-switch-copy">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button type="button" onClick={switchMode}>{isRegister ? 'Đăng nhập' : 'Đăng ký miễn phí'}</button>
          </p>
          <p className="auth-terms">Bằng việc tiếp tục, bạn đồng ý với <a href="#terms">Điều khoản sử dụng</a> và <a href="#privacy">Chính sách bảo mật</a>.</p>
        </div>
        <div className="auth-panel-footer"><span><LockKeyhole size={13} /> Thông tin của bạn luôn được bảo mật</span><span>© 2026 StuWork</span></div>
      </section>
    </main>
  )
}

export default AuthPage
