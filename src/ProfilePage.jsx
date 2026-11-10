import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, FileText, Trash2, Upload } from 'lucide-react'
import { downloadApiFile, requestApiJson, uploadApiFile } from './api.js'

const maxCvBytes = 5 * 1024 * 1024
const allowedExtensions = ['.pdf', '.doc', '.docx']

function ProfilePage({ accessToken, onBack, onProfileSaved, onNotice }) {
  const [profile, setProfile] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [cvError, setCvError] = useState('')
  const [saving, setSaving] = useState(false)
  const [cvBusy, setCvBusy] = useState(false)
  const fileInput = useRef(null)

  useEffect(() => {
    let cancelled = false
    requestApiJson('/api/profile', { accessToken })
      .then((result) => { if (!cancelled) setProfile(result.profile) })
      .catch((requestError) => { if (!cancelled) setLoadError(requestError.message) })
    return () => { cancelled = true }
  }, [accessToken])

  const handleSave = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      const result = await requestApiJson('/api/profile', { method: 'PUT', body: values, accessToken })
      setProfile(result.profile)
      onProfileSaved(result.profile)
      onNotice('Đã cập nhật hồ sơ.')
    } catch (saveError) {
      setError(saveError.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleCvChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setCvError('')
    const lowerName = file.name.toLowerCase()
    if (!allowedExtensions.some((extension) => lowerName.endsWith(extension))) {
      setCvError('CV chỉ hỗ trợ định dạng PDF, DOC hoặc DOCX.')
      return
    }
    if (file.size > maxCvBytes) {
      setCvError('File quá lớn. CV tối đa 5 MB.')
      return
    }
    setCvBusy(true)
    try {
      const result = await uploadApiFile('/api/profile/cv', file, accessToken)
      setProfile(result.profile)
      onNotice('Đã tải CV lên.')
    } catch (uploadError) {
      setCvError(uploadError.message || 'Không thể tải CV lên. Vui lòng thử lại.')
    } finally {
      setCvBusy(false)
    }
  }

  const handleCvDownload = async () => {
    setCvError('')
    try {
      await downloadApiFile('/api/profile/cv', accessToken, profile.cv.name)
    } catch (downloadError) {
      setCvError(downloadError.message || 'Không thể tải CV về.')
    }
  }

  const handleCvDelete = async () => {
    setCvError('')
    setCvBusy(true)
    try {
      const result = await requestApiJson('/api/profile/cv', { method: 'DELETE', accessToken })
      setProfile(result.profile)
      onNotice('Đã xóa CV.')
    } catch (deleteError) {
      setCvError(deleteError.message || 'Không thể xóa CV.')
    } finally {
      setCvBusy(false)
    }
  }

  return (
    <main className="section profile-page">
      <div className="page-shell">
        <button className="back-link" type="button" onClick={onBack}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1 className="profile-title">Cập nhật hồ sơ</h1>

        {loadError && <p className="contact-form-error" role="alert">{loadError}</p>}
        {!profile && !loadError && <p className="profile-loading">Đang tải hồ sơ...</p>}

        {profile && (
          <div className="profile-layout">
            <form className="contact-form profile-card" onSubmit={handleSave}>
              <h2>Thông tin cá nhân</h2>
              <div className="contact-form-fields">
                <label>
                  <span>Họ và tên</span>
                  <input name="name" type="text" defaultValue={profile.name} minLength="2" maxLength="80" required />
                </label>
                <label>
                  <span>Số điện thoại</span>
                  <input name="phone" type="tel" defaultValue={profile.phone} required />
                </label>
                <label className="contact-form-subject">
                  <span>Email (không thể thay đổi)</span>
                  <input type="email" value={profile.email} readOnly disabled />
                </label>
                <label>
                  <span>Trường đại học</span>
                  <input name="university" type="text" defaultValue={profile.university} maxLength="120" />
                </label>
                <label>
                  <span>Ngành học</span>
                  <input name="major" type="text" defaultValue={profile.major} maxLength="120" />
                </label>
                <label>
                  <span>Năm tốt nghiệp</span>
                  <input name="graduationYear" type="number" defaultValue={profile.graduationYear} min="2000" max="2100" />
                </label>
                <label>
                  <span>Kỹ năng (cách nhau bằng dấu phẩy)</span>
                  <input name="skills" type="text" defaultValue={profile.skills} maxLength="300" />
                </label>
                <label className="contact-form-message">
                  <span>Giới thiệu bản thân</span>
                  <textarea name="bio" rows="4" defaultValue={profile.bio} maxLength="1000" />
                </label>
              </div>
              {error && <p className="contact-form-error" role="alert">{error}</p>}
              <button className="button button-primary contact-submit" type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>

            <section className="profile-card cv-card" aria-label="CV của bạn">
              <h2>CV của bạn</h2>
              {profile.cv ? (
                <div className="cv-file">
                  <FileText size={22} />
                  <div>
                    <strong title={profile.cv.name}>{profile.cv.name}</strong>
                    <small>Tải lên lúc {profile.cv.uploadedAt}</small>
                  </div>
                </div>
              ) : (
                <div className="application-history-empty">
                  <FileText size={24} />
                  <p>Bạn chưa tải CV lên. Cần có CV để ứng tuyển.</p>
                </div>
              )}
              <input
                ref={fileInput}
                className="cv-input"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                onChange={handleCvChange}
                hidden
              />
              <div className="cv-actions">
                <button className="button button-primary" type="button" disabled={cvBusy} onClick={() => fileInput.current?.click()}>
                  <Upload size={14} /> {profile.cv ? 'Thay CV' : 'Tải CV lên'}
                </button>
                {profile.cv && (
                  <>
                    <button className="button button-outline" type="button" disabled={cvBusy} onClick={handleCvDownload}>
                      <Download size={14} /> Tải về
                    </button>
                    <button className="button button-outline" type="button" disabled={cvBusy} onClick={handleCvDelete}>
                      <Trash2 size={14} /> Xóa
                    </button>
                  </>
                )}
              </div>
              <small className="cv-hint">Hỗ trợ PDF, DOC, DOCX — tối đa 5 MB.</small>
              {cvError && <p className="contact-form-error" role="alert">{cvError}</p>}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

export default ProfilePage
