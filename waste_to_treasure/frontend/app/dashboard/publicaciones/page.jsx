'use client';

import { useState } from 'react';
// Importamos los componentes que creamos para este flujo
import VerticalStepper from '@/components/dashboard/VerticalStepper';
import Step1_Type from '@/components/dashboard/Step1_Type';
import Step2_Info from '@/components/dashboard/Step2_Info';
import Step3_Media from '@/components/dashboard/Step3_Media';
import Step4_Review from '@/components/dashboard/Step4_Review';

/**
 * Este es el componente "Controlador" o "Asistente" (Wizard).
 * Gestiona el estado principal y renderiza el paso actual.
 */
export default function PublishItemPage() {
  const [step, setStep] = useState(1);
  const [listingData, setListingData] = useState({
    // Paso 1
    type: null, // 'PRODUCT' o 'MATERIAL'
    category: '',
    // Paso 2
    title: '',
    description: '',
    price: '',
    quantity: 1,
    condition: '', // 'NEW', 'USED', 'REFURBISHED'
    // Paso 3
    images: [], // Array de File objects o URLs
  });

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handlePublish = () => {
    console.log('Publicando:', listingData);
    // Lógica de API para enviar `listingData`
    // alert('Publicando... (revisar consola)');
  };

  // Función unificada para actualizar el estado
  // la pasamos como prop a los componentes de cada paso
  const updateListingData = (newData) => {
    setListingData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1_Type
            onNext={handleNext}
            listingData={listingData}
            updateListingData={updateListingData}
          />
        );
      case 2:
        return (
          <Step2_Info
            onNext={handleNext}
            onBack={handleBack}
            listingData={listingData}
            updateListingData={updateListingData}
          />
        );
      case 3:
         return (
          <Step3_Media
            onNext={handleNext}
            onBack={handleBack}
            listingData={listingData}
            updateListingData={updateListingData}
          />
        );
      case 4:
        return (
          <Step4_Review
            onPublish={handlePublish}
            onBack={handleBack}
            listingData={listingData}
            setStep={setStep} // Para permitir al usuario "editar"
          />
        );
      default:
        // Por defecto, mostrar el paso 1
        return (
          <Step1_Type
            onNext={handleNext}
            listingData={listingData}
            updateListingData={updateListingData}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-black dark:text-white text-3xl font-poppins font-semibold">
        Publicar un nuevo ítem
      </h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* El Stepper siempre es visible */}
        <VerticalStepper currentStep={step} />
        
        {/* El contenido del paso actual se renderiza aquí */}
        <div className="flex-1">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}