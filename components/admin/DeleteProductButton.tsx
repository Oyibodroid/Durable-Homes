'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/Toast'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const formData = new FormData()
      formData.append('id', productId)
      
      const res = await fetch('/api/products/delete', {
        method: 'DELETE',
        body: formData,
      })
      
      if (!res.ok) throw new Error()
      
      toast.success('Product deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsModalOpen(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productName}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}