import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { categoryApi, type Category, type CreateCategoryDto, type UpdateCategoryDto } from '@/lib/api/category'

export default function Categories() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [createForm, setCreateForm] = useState<CreateCategoryDto>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  })

  const [editForm, setEditForm] = useState<UpdateCategoryDto>({})

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'ADMIN') {
      setError('Bu sayfaya erişim yetkiniz yok. Sadece admin kullanıcılar erişebilir.')
      setLoading(false)
      return
    }

    fetchCategories()
  }, [user])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryApi.getAll()
      setCategories(response.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kategoriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Generate slug from name if not provided
      const slug = createForm.slug || createForm.name.toLowerCase().replace(/\s+/g, '-')

      await categoryApi.create({
        ...createForm,
        slug,
      })
      setSuccess('Kategori başarıyla oluşturuldu!')
      setCreateForm({ name: '', slug: '', description: '', isActive: true })
      setShowCreateForm(false)
      fetchCategories()
    } catch (err: any) {
      const errorData = err.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.message + ': ' + errorData.errors.join(', '))
      } else {
        setError(errorData?.message || 'Kategori oluşturulamadı')
      }
    }
  }

  const handleUpdate = async (id: string) => {
    setError('')
    setSuccess('')

    try {
      await categoryApi.update(id, editForm)
      setSuccess('Kategori başarıyla güncellendi!')
      setEditingId(null)
      setEditForm({})
      fetchCategories()
    } catch (err: any) {
      const errorData = err.response?.data
      setError(errorData?.message || 'Kategori güncellenemedi')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} kategorisini silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      await categoryApi.delete(id)
      setSuccess('Kategori başarıyla silindi!')
      fetchCategories()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kategori silinemedi')
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      isActive: category.isActive,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="card">
        <div className="text-red-600">{error || 'Bu sayfaya erişim yetkiniz yok.'}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kategori Yönetimi</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'İptal' : '+ Yeni Kategori'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Yeni Kategori Ekle</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      name: e.target.value,
                      slug: createForm.slug || e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  required
                  maxLength={100}
                  className="input"
                  placeholder="Sedan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.slug}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, slug: e.target.value })
                  }
                  required
                  maxLength={100}
                  className="input"
                  placeholder="sedan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  maxLength={500}
                  rows={3}
                  className="input"
                  placeholder="Kategori açıklaması..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, isActive: e.target.checked })
                  }
                  className="mr-2"
                  id="createIsActive"
                />
                <label htmlFor="createIsActive" className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary">
                Kategori Oluştur
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setCreateForm({ name: '', slug: '', description: '', isActive: true })
                }}
                className="btn btn-secondary"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Henüz kategori bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="card">
              {editingId === category.id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori Adı
                      </label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        maxLength={100}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={editForm.slug || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, slug: e.target.value })
                        }
                        maxLength={100}
                        className="input"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, description: e.target.value })
                        }
                        maxLength={500}
                        rows={3}
                        className="input"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.isActive !== undefined ? editForm.isActive : category.isActive}
                        onChange={(e) =>
                          setEditForm({ ...editForm, isActive: e.target.checked })
                        }
                        className="mr-2"
                        id="editIsActive"
                      />
                      <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">
                        Aktif
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleUpdate(category.id)}
                      className="btn btn-primary"
                    >
                      Kaydet
                    </button>
                    <button onClick={cancelEdit} className="btn btn-secondary">
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Slug:</span> {category.slug}
                    </p>
                    {category.description && (
                      <p className="text-gray-700">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="btn btn-secondary text-sm"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="btn btn-danger text-sm"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

