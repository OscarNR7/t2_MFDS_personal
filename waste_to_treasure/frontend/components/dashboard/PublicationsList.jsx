'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMyListings } from '@/hooks/useMyListings'
import { Loader2, AlertCircle, Trash2, Edit } from 'lucide-react'

// Componente para la Fila de la Tabla
function PublicationRow({ pub, onDelete }) {
  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas desactivar "${pub.title}"? Esta acción cambiará el estado a INACTIVO.`)) {
      onDelete(pub.listing_id)
    }
  }

  const formatPrice = (price, unit) => {
    const formatted = `$${price.toFixed(2)}`
    return unit ? `${formatted}/${unit}` : formatted
  }

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-700 border-green-300',
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      REJECTED: 'bg-red-100 text-red-700 border-red-300',
      INACTIVE: 'bg-gray-100 text-gray-700 border-gray-300',
    }
    return badges[status] || badges.INACTIVE
  }

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Activa',
      PENDING: 'Pendiente',
      REJECTED: 'Rechazada',
      INACTIVE: 'Inactiva',
    }
    return labels[status] || status
  }

  return (
    <tr className="border-b border-neutral-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-2">
        <div className="flex items-center gap-3">
          {pub.images && pub.images.length > 0 && (
            <img
              src={pub.images[0].image_url}
              alt={pub.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <p className="font-inter text-sm font-semibold text-[#353A44]">
              {pub.title}
            </p>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${getStatusBadge(pub.status)}`}>
              {getStatusLabel(pub.status)}
            </span>
          </div>
        </div>
      </td>
      <td className="py-4 px-2 font-inter text-sm font-medium text-[#353A44]">
        {formatPrice(pub.price, pub.price_unit)}
      </td>
      <td className="py-4 px-2 font-inter text-sm text-[#596171]">
        {pub.listing_type === 'MATERIAL' ? 'Material' : 'Producto'}
      </td>
      <td className="py-4 px-2 font-inter text-sm text-[#596171]">
        {pub.quantity} {pub.price_unit || ''}
      </td>
      <td className="py-4 px-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/publicaciones/${pub.listing_id}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-primary-500 bg-primary-500/20 px-4 py-1.5 font-inter text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-500/30"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={pub.status === 'INACTIVE'}
            className="inline-flex items-center gap-1 rounded-lg border border-red-500 bg-red-500/20 px-4 py-1.5 font-inter text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Desactivar
          </button>
        </div>
      </td>
    </tr>
  )
}

// Componente para la Pestaña
function TabButton({ label, count, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 pb-2 font-inter text-base font-semibold transition-colors
        ${
          isActive
            ? 'border-primary-500 text-primary-500'
            : 'border-transparent text-neutral-900/60 hover:text-neutral-900'
        }
      `}
    >
      {label} ({count})
    </button>
  )
}

export default function PublicationsList() {
  const [activeTab, setActiveTab] = useState('all')
  const { listings, isLoading, error, fetchListings, deleteListing } = useMyListings()

  // Filtrar publicaciones según la pestaña activa
  const getFilteredListings = () => {
    switch (activeTab) {
      case 'active':
        return listings.filter(l => l.status === 'ACTIVE')
      case 'pending':
        return listings.filter(l => l.status === 'PENDING')
      case 'inactive':
        return listings.filter(l => l.status === 'INACTIVE' || l.status === 'REJECTED')
      default:
        return listings
    }
  }

  const filteredListings = getFilteredListings()

  // Contar publicaciones por estado
  const counts = {
    active: listings.filter(l => l.status === 'ACTIVE').length,
    pending: listings.filter(l => l.status === 'PENDING').length,
    inactive: listings.filter(l => l.status === 'INACTIVE' || l.status === 'REJECTED').length,
  }

  const handleDelete = async (listingId) => {
    try {
      await deleteListing(listingId)
      // El hook ya recarga la lista automáticamente
    } catch (err) {
      alert('Error al desactivar la publicación: ' + err.message)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Mostrar loader mientras carga
  if (isLoading && listings.length === 0) {
    return (
      <div className="w-full rounded-xl bg-white p-8 shadow-lg flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl bg-white p-8 shadow-lg">
      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 font-inter">{error}</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-neutral-900/60 pb-4 md:flex-row md:items-center">
        <h1 className="font-poppins text-3xl font-bold text-neutral-900">
          Mis Publicaciones
        </h1>
        <Link
          href="/dashboard/publicaciones/nuevo"
          className="w-full rounded-lg bg-primary-500 px-6 py-3 text-center font-inter text-base font-semibold text-white transition-colors hover:bg-primary-600 md:w-auto"
        >
          Publicar Nuevo
        </Link>
      </div>

      {/* Pestañas de Filtro */}
      <div className="mt-6 flex items-center gap-6 border-b border-neutral-900/60">
        <TabButton
          label="Activas"
          count={counts.active}
          isActive={activeTab === 'active'}
          onClick={() => handleTabChange('active')}
        />
        <TabButton
          label="Pendientes"
          count={counts.pending}
          isActive={activeTab === 'pending'}
          onClick={() => handleTabChange('pending')}
        />
        <TabButton
          label="Inactivas"
          count={counts.inactive}
          isActive={activeTab === 'inactive'}
          onClick={() => handleTabChange('inactive')}
        />
      </div>

      {/* Tabla de Publicaciones */}
      <div className="mt-6 w-full overflow-x-auto">
        <table className="w-full min-w-[700px] table-auto text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="w-2/5 py-3 px-2 font-inter text-xs font-semibold uppercase text-[#353A43]">
                Publicación
              </th>
              <th className="w-1/5 py-3 px-2 font-inter text-xs font-semibold uppercase text-[#353A43]">
                Precio
              </th>
              <th className="w-1/5 py-3 px-2 font-inter text-xs font-semibold uppercase text-[#353A43]">
                Tipo
              </th>
              <th className="w-1/5 py-3 px-2 font-inter text-xs font-semibold uppercase text-[#353A43]">
                Stock
              </th>
              <th className="w-1/5 py-3 px-2 font-inter text-xs font-semibold uppercase text-[#353A43]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.length > 0 ? (
              filteredListings.map(pub => (
                <PublicationRow
                  key={pub.listing_id}
                  pub={pub}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="py-12 text-center font-inter text-neutral-600"
                >
                  {activeTab === 'active' && 'No tienes publicaciones activas.'}
                  {activeTab === 'pending' && 'No tienes publicaciones pendientes.'}
                  {activeTab === 'inactive' && 'No tienes publicaciones inactivas.'}
                  {activeTab === 'all' && 'No tienes publicaciones registradas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      {filteredListings.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 font-inter">
          Mostrando {filteredListings.length} de {listings.length} publicaciones
        </div>
      )}
    </div>
  )
}