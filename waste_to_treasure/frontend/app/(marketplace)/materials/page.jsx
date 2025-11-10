'use client'

import { useState } from 'react'
import SearchBar from '@/components/marketplace/SearchBar'
import FilterSection from '@/components/marketplace/FilterSection'
import SortDropdown from '@/components/marketplace/SortDropdown'
import MaterialCard from '@/components/marketplace/MaterialCard'
import Pagination from '@/components/marketplace/Pagination'

// Mock data for materials - Replace with API call
const mockMaterials = [
  {
    id: 1,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://th.bing.com/th/id/R.7bb37e8a014b68ab774be2620c16ccae?rik=8FDwJuvB2NO0Vg&pid=ImgRaw&r=0',
  },
  {
    id: 2,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://www.xlsemanal.com/wp-content/uploads/sites/3/2018/10/plasticos-toxicos.jpg',
  },
  {
    id: 3,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://th.bing.com/th/id/R.7bb37e8a014b68ab774be2620c16ccae?rik=8FDwJuvB2NO0Vg&pid=ImgRaw&r=0',
  },
  {
    id: 4,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://www.xlsemanal.com/wp-content/uploads/sites/3/2018/10/plasticos-toxicos.jpg',
  },
  {
    id: 5,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://th.bing.com/th/id/R.7bb37e8a014b68ab774be2620c16ccae?rik=8FDwJuvB2NO0Vg&pid=ImgRaw&r=0',
  },
  {
    id: 6,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://www.xlsemanal.com/wp-content/uploads/sites/3/2018/10/plasticos-toxicos.jpg',
  },
  {
    id: 7,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://th.bing.com/th/id/R.7bb37e8a014b68ab774be2620c16ccae?rik=8FDwJuvB2NO0Vg&pid=ImgRaw&r=0',
  },
  {
    id: 8,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://www.xlsemanal.com/wp-content/uploads/sites/3/2018/10/plasticos-toxicos.jpg',
  },
  {
    id: 9,
    title: 'Plástico triturado HDPE',
    seller: 'Maquiladora XXX',
    price: 950.0,
    unit: 'KG',
    available: 1,
    unit_measure: 'Tonelada',
    isResidue: true,
    imageUrl: 'https://th.bing.com/th/id/R.7bb37e8a014b68ab774be2620c16ccae?rik=8FDwJuvB2NO0Vg&pid=ImgRaw&r=0',
  },
]

export default function MaterialsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [sortOption, setSortOption] = useState('Más recientes')
  const [filters, setFilters] = useState({})

  const totalPages = 5
  const totalMaterials = 152

  const handleSearch = (term) => {
    setSearchTerm(term)
    // TODO: Implement search functionality with API
    console.log('Searching for:', term)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    // TODO: Implement category filtering with API
    console.log('Category changed to:', category)
  }

  const handleSortChange = (option) => {
    setSortOption(option)
    // TODO: Implement sorting with API
    console.log('Sort changed to:', option)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    // TODO: Implement filtering with API
    console.log('Filters changed:', newFilters)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // TODO: Implement pagination with API
    console.log('Page changed to:', page)
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Hero Section */}
      <section className="bg-white px-4 pb-6 pt-10 sm:px-6 lg:px-[220px]">
        <h1 className="mb-6 font-poppins text-5xl font-bold text-black">
          Materiales Disponibles
        </h1>
        <SearchBar
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
        />
      </section>

      {/* Main Content */}
      <section className="flex gap-10 px-4 py-10 sm:px-6 lg:px-[220px]">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block">
          <FilterSection onFiltersChange={handleFiltersChange} />
        </aside>

        {/* Materials Grid */}
        <div className="flex flex-1 flex-col gap-8 rounded-lg bg-neutral-50 p-6 shadow-md">
          {/* Header */}
          <div className="flex items-end justify-between border-b border-black/50 pb-4">
            <div className="flex flex-col gap-2.5">
              <h2 className="font-roboto text-[26px] font-semibold text-black">
                Materiales Disponibles
              </h2>
              <p className="font-inter text-base text-black/80">
                {totalMaterials} materiales encontrados
              </p>
            </div>
            <SortDropdown onSortChange={handleSortChange} />
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {mockMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center pt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
