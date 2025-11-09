import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api/auth'
import { format } from 'date-fns'

export default function Profile() {
  const { user, fetchProfile } = useAuthStore()
  const [loginHistory, setLoginHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const history = await authApi.getLoginHistory()
        setLoginHistory(history.data || history || [])
      } catch (err) {
        console.error('Failed to fetch login history:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchLoginHistory()
    }
  }, [user])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor')
      return
    }

    setPasswordLoading(true)
    try {
      await authApi.changePassword({
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword,
      })
      setPasswordSuccess('Şifre başarıyla değiştirildi')
      setChangePasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message || 'Şifre değiştirilemedi. Lütfen tekrar deneyin.'
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profil</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Kişisel Bilgiler</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad
              </label>
              <div className="text-gray-900">{user.firstName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soyad
              </label>
              <div className="text-gray-900">{user.lastName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <div className="text-gray-900">{user.email}</div>
            </div>

            {user.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <div className="text-gray-900">{user.phone}</div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {user.role}
              </span>
            </div>

            {user.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kayıt Tarihi
                </label>
                <div className="text-gray-900">
                  {format(new Date(user.createdAt), 'dd MMM yyyy')}
                </div>
              </div>
            )}

            {user.lastLoginAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Giriş
                </label>
                <div className="text-gray-900">
                  {format(new Date(user.lastLoginAt), 'dd MMM yyyy HH:mm')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Şifre Değiştir</h2>
          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {passwordSuccess}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mevcut Şifre
              </label>
              <input
                type="password"
                value={changePasswordData.currentPassword}
                onChange={(e) =>
                  setChangePasswordData({
                    ...changePasswordData,
                    currentPassword: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={changePasswordData.newPassword}
                onChange={(e) =>
                  setChangePasswordData({
                    ...changePasswordData,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={8}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                value={changePasswordData.confirmPassword}
                onChange={(e) =>
                  setChangePasswordData({
                    ...changePasswordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                minLength={8}
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-primary w-full"
            >
              {passwordLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>
      </div>

      {/* Login History */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Giriş Geçmişi</h2>
        {loading ? (
          <div className="text-gray-600">Yükleniyor...</div>
        ) : loginHistory.length === 0 ? (
          <p className="text-gray-600">Giriş geçmişi bulunamadı.</p>
        ) : (
          <div className="space-y-2">
            {loginHistory.slice(0, 10).map((entry: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {entry.ipAddress || 'Bilinmeyen IP'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.userAgent || 'Bilinmeyen cihaz'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {entry.timestamp || entry.createdAt
                      ? format(
                          new Date(entry.timestamp || entry.createdAt),
                          'dd MMM yyyy HH:mm'
                        )
                      : 'Bilinmeyen tarih'}
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                      entry.success !== false
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {entry.success !== false ? 'Başarılı' : 'Başarısız'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
