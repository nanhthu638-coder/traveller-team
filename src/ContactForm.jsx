import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { requestApiJson } from './api.js'

function ContactForm({ onSubmitted }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = event.currentTarget
    const formData = new FormData(form)
    try {
      await requestApiJson('/api/contact', {
        method: 'POST',
        body: Object.fromEntries(formData.entries()),
      })
      form.reset()
      onSubmitted('Biểu mẫu của bạn đã được gửi.')
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi biểu mẫu. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-fields">
        <label>
          <span>Họ và tên</span>
          <input name="name" type="text" autoComplete="name" minLength="2" maxLength="80" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" maxLength="254" required />
        </label>
        <label className="contact-form-subject">
          <span>Chủ đề</span>
          <input name="subject" type="text" minLength="3" maxLength="120" required />
        </label>
        <label className="contact-form-message">
          <span>Nội dung thắc mắc</span>
          <textarea name="message" rows="5" minLength="10" maxLength="5000" required />
        </label>
      </div>
      {error && <p className="contact-form-error" role="alert">{error}</p>}
      <button className="button button-primary contact-submit" type="submit" disabled={submitting}>
        {submitting ? 'Đang gửi...' : 'Gửi biểu mẫu'} {!submitting && <ArrowRight size={16} />}
      </button>
    </form>
  )
}

export default ContactForm
