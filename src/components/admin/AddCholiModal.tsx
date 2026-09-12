'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addCholi, createCholiApi, updateCholiApi } from '@/store/choliSlice';
import { openAuthModal } from '@/store/authSlice';
import { Choli, CholiCategory, CholiStatus } from '@/types';
import { APP_CONFIG, CHOLI_CATEGORIES, CHOLI_SIZES } from '@/constants';
import { X, Sparkles, Plus, Image as ImageIcon, DollarSign, Trash2, Layers, Upload, Loader2, Link as LinkIcon, Edit3, CheckCircle2, Crown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import InstagramIcon from '@mui/icons-material/Instagram';
import { BoutiqueAutocomplete } from '@/components/common/BoutiqueAutocomplete';
import { toast } from 'sonner';

interface AddCholiModalProps {
  isOpen: boolean;
  onClose: () => void;
  choliToEdit?: Choli | null;
}

export function AddCholiModal({ isOpen, onClose, choliToEdit }: AddCholiModalProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const cholis = useAppSelector((state) => state.cholis.items);

  const generateUniqueSku = () => {
    let nextNum = Math.floor(100 + Math.random() * 900);
    let candidate = `SK-${nextNum}`;
    let attempts = 0;
    while (cholis.some((c) => c.sku?.toLowerCase() === candidate.toLowerCase()) && attempts < 100) {
      nextNum = Math.floor(100 + Math.random() * 900);
      candidate = `SK-${nextNum}`;
      attempts++;
    }
    return candidate;
  };

  const isEdit = Boolean(choliToEdit);
  const [sku, setSku] = useState(`SK-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CholiCategory>('Bridal');
  const [color, setColor] = useState('');
  const [fabric, setFabric] = useState('');
  const [blouseSize, setBlouseSize] = useState('36 (Alterable 34-38)');
  const [skirtLength, setSkirtLength] = useState<number>(42);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [status, setStatus] = useState<CholiStatus>('AVAILABLE');
  
  // Multi-Photo Management State (Supports concurrent multi-photo uploads)
  const MAX_PHOTOS = 10;
  const [photoInputs, setPhotoInputs] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial Costing (ADMIN ONLY) - Clean initial state
  const [totalCosting, setTotalCosting] = useState<number | ''>('');
  const [rentalPrice, setRentalPrice] = useState<number | ''>('');
  const [securityDeposit, setSecurityDeposit] = useState<number | ''>('');
  const [dryCleaningFee, setDryCleaningFee] = useState<number | ''>(0);
  const [description, setDescription] = useState('');

  // Complete Form Reset Function
  const resetForm = () => {
    if (choliToEdit) {
      setSku(choliToEdit.sku || '');
      setName(choliToEdit.name || '');
      setCategory(choliToEdit.category || 'Bridal');
      setColor(choliToEdit.color || '');
      setFabric(choliToEdit.fabric || '');
      setBlouseSize(choliToEdit.blouseSize || '36 (Alterable 34-38)');
      setSkirtLength(choliToEdit.skirtLength || 42);
      setInstagramUrl(choliToEdit.instagramUrl || '');
      setPhotoInputs([...(choliToEdit.images || [])]);
      setNewPhotoUrl('');
      setIsUploadingPhoto(false);
      setUploadProgressText('');
      setIsDraggingOver(false);
      setDraggedPhotoIndex(null);
      setTotalCosting(choliToEdit.totalCosting ?? '');
      setRentalPrice(choliToEdit.rentalPricePerEvent ?? '');
      setSecurityDeposit(choliToEdit.securityDeposit ?? '');
      setDryCleaningFee(choliToEdit.dryCleaningFee ?? 0);
      setDescription(choliToEdit.description || '');
      setStatus(choliToEdit.status || 'AVAILABLE');
    } else {
      setSku(generateUniqueSku());
      setName('');
      setCategory('Bridal');
      setColor('');
      setFabric('');
      setBlouseSize('36 (Alterable 34-38)');
      setSkirtLength(42);
      setInstagramUrl('');
      setPhotoInputs([]);
      setNewPhotoUrl('');
      setIsUploadingPhoto(false);
      setUploadProgressText('');
      setIsDraggingOver(false);
      setDraggedPhotoIndex(null);
      setTotalCosting('');
      setRentalPrice('');
      setSecurityDeposit('');
      setDryCleaningFee(0);
      setDescription('');
      setStatus('AVAILABLE');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset form whenever modal opens or choliToEdit changes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, choliToEdit]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Unauthenticated guests: prompt friendly sign-in modal
  if (!currentUser) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-[#072622] p-6 rounded-3xl max-w-sm text-center space-y-4 border border-[#DFBD76]/50 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-[#084C42]/10 dark:bg-[#DFBD76]/20 border border-[#DFBD76]/50 flex items-center justify-center mx-auto text-[#084C42] dark:text-[#DFBD76]">
            <Crown className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAF6EC]">
              Staff / Admin Sign In
            </h3>
            <p className="text-xs text-stone-500 dark:text-[#9BB5AF]">
              Please sign in as Boutique Admin or Staff to catalog new choli arrivals and manage vault inventory.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] text-xs font-bold text-[#78716C] dark:text-[#9BB5AF]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                dispatch(openAuthModal());
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/50 text-xs font-bold shadow-md hover:opacity-95"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    if (photoInputs.length >= MAX_PHOTOS) {
      toast.warning(`Maximum ${MAX_PHOTOS} photos allowed per choli.`);
      return;
    }
    setPhotoInputs([...photoInputs, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
    toast.success('Photo added to showcase preview');
  };

  // Centralized batch photo uploader supporting multiple concurrent images
  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    const currentCount = photoInputs.length;
    const remainingSlots = Math.max(0, MAX_PHOTOS - currentCount);

    if (remainingSlots <= 0) {
      toast.warning(`Maximum ${MAX_PHOTOS} photos allowed per choli.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToUpload = imageFiles.slice(0, remainingSlots);
    if (imageFiles.length > remainingSlots) {
      toast.info(`Selected ${imageFiles.length} photos; uploading first ${remainingSlots} to stay within the ${MAX_PHOTOS}-photo limit.`);
    }

    try {
      setIsUploadingPhoto(true);
      let completedCount = 0;
      setUploadProgressText(
        filesToUpload.length > 1
          ? `Uploading 0 of ${filesToUpload.length} photos (separate /api/upload-file calls)...`
          : 'Uploading photo to /api/upload-file...'
      );

      // Perform a distinct /api/upload-file API call for EACH individual photo
      const uploadPromises = filesToUpload.map(async (file, idx) => {
        const singleFormData = new FormData();
        singleFormData.append('file', file);

        const res = await fetch('/api/upload-file', {
          method: 'POST',
          body: singleFormData,
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.url) {
          throw new Error(data.error || `Failed to upload photo ${idx + 1} (${file.name})`);
        }

        completedCount++;
        if (filesToUpload.length > 1) {
          setUploadProgressText(`Uploaded ${completedCount} of ${filesToUpload.length} photos...`);
        }
        return data.url as string;
      });

      const newUrls = await Promise.all(uploadPromises);

      if (newUrls.length > 0) {
        setPhotoInputs((prev) => [...prev, ...newUrls]);
        toast.success(
          newUrls.length > 1
            ? `${newUrls.length} photos uploaded via separate API calls successfully!`
            : 'Photo uploaded to Cloudinary successfully!',
          {
            description: 'Photo URLs ready for main Add Choli catalog submission.'
          }
        );
      }
    } catch (err: any) {
      console.warn('Cloudinary upload issue, applying direct local preview fallback:', err);
      // Fallback: Read as Data URLs so the user is never blocked
      try {
        const base64Promises = filesToUpload.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        });
        const base64Urls = (await Promise.all(base64Promises)).filter(Boolean);
        if (base64Urls.length > 0) {
          setPhotoInputs((prev) => [...prev, ...base64Urls]);
          toast.success(
            base64Urls.length > 1
              ? `${base64Urls.length} photos attached to outfit!`
              : 'Photo attached to outfit!'
          );
        } else {
          toast.error(err.message || 'Error uploading photo(s)');
        }
      } catch (fallbackErr) {
        toast.error(err.message || 'Failed to attach image');
      }
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    await uploadFiles(Array.from(fileList));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (droppedFiles.length === 0) return;
    await uploadFiles(droppedFiles);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotoInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Reorder photo sequence (e.g., move photo 2 to first / cover position)
  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photoInputs.length || fromIndex === toIndex) return;
    setPhotoInputs((prev) => {
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
    toast.info(
      toIndex === 0
        ? `Photo #${fromIndex + 1} set as Cover Photo (#1)!`
        : `Moved photo #${fromIndex + 1} to position #${toIndex + 1}`
    );
  };

  const handleMakeCover = (idx: number) => {
    handleMovePhoto(idx, 0);
  };

  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePhotoDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === targetIndex) return;
    handleMovePhoto(draggedPhotoIndex, targetIndex);
    setDraggedPhotoIndex(null);
  };

  const handleUsePlaceholderPhoto = () => {
    if (photoInputs.length >= MAX_PHOTOS) {
      toast.warning(`Maximum ${MAX_PHOTOS} photos reached.`);
      return;
    }
    setPhotoInputs((prev) => [...prev, '/logo-cropped.png']);
    toast.success('Boutique logo attached as showcase photo.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !color.trim() || rentalPrice === '') {
      toast.error('Please fill in mandatory details (Choli Title, Color, Rental Rate).');
      return;
    }

    let finalPhotos = [...photoInputs];
    if (finalPhotos.length === 0) {
      finalPhotos = ['/logo-cropped.png'];
      toast.info('No photos selected; defaulted to boutique logo placeholder.');
    }

    const calculatedCost = totalCosting !== '' ? Number(totalCosting) : 0;
    const calculatedRent = Number(rentalPrice);
    const calculatedDeposit = securityDeposit !== '' ? Number(securityDeposit) : 0;
    const calculatedDryCleaning = dryCleaningFee !== '' ? Number(dryCleaningFee) : 0;

    setIsSubmitting(true);
    try {
      if (isEdit && choliToEdit) {
        const updatedCholi: Choli = {
          ...choliToEdit,
          sku: sku.trim(),
          name: name.trim(),
          category,
          color: color.trim(),
          fabric: fabric.trim() || 'Pure Heritage Fabric',
          blouseSize,
          skirtLength: Number(skirtLength || 42),
          images: finalPhotos,
          totalCosting: calculatedCost,
          rentalPricePerEvent: calculatedRent,
          securityDeposit: calculatedDeposit,
          dryCleaningFee: calculatedDryCleaning,
          status,
          description: description.trim() || `${name.trim()} - handcrafted designer choli with intricate artistry.`,
          instagramUrl: instagramUrl.trim() || undefined,
          isBreakEvenReached: (choliToEdit.totalEarnedFromRent || 0) >= calculatedCost,
        };

        await dispatch(updateCholiApi(updatedCholi)).unwrap();
        toast.success(`Choli "${sku}" successfully updated!`, {
          description: 'Modifications saved to vault inventory and database.',
        });
      } else {
        const newCholi: Choli = {
          _id: `choli-${Date.now()}`,
          sku: sku.trim(),
          name: name.trim(),
          category,
          color: color.trim(),
          fabric: fabric.trim() || 'Pure Heritage Fabric',
          blouseSize,
          skirtLength: Number(skirtLength || 42),
          images: finalPhotos,
          totalCosting: calculatedCost,
          rentalPricePerEvent: calculatedRent,
          securityDeposit: calculatedDeposit,
          dryCleaningFee: calculatedDryCleaning,
          totalEarnedFromRent: 0,
          isBreakEvenReached: false,
          status,
          description: description.trim() || `${name.trim()} - handcrafted designer choli with intricate artistry.`,
          bufferDaysBefore: 1,
          bufferDaysAfter: 2,
          instagramUrl: instagramUrl.trim() || undefined,
          createdAt: new Date().toISOString(),
        };

        await dispatch(createCholiApi(newCholi)).unwrap();
        toast.success(`Choli "${sku}" successfully cataloged with ${finalPhotos.length} photos!`);
      }
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error saving choli:', err);
      const errorMsg = typeof err === 'string'
        ? err
        : (err?.message || 'Failed to save choli details. Please check the fields and try again.');
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#072622] rounded-2xl sm:rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 overflow-hidden">
          
          {/* Sticky Modal Top Header (Always visible and pinned) */}
          <div className="flex-shrink-0 bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] px-4 py-3.5 sm:px-6 sm:py-4 text-white flex items-center justify-between border-b border-white/10 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#DFBD76]/20 border border-[#DFBD76]/40 flex items-center justify-center text-[#DFBD76] flex-shrink-0">
                {isEdit ? <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-base sm:text-lg font-bold truncate">
                    {isEdit ? 'Edit Choli Details' : 'Catalog New Choli (Multi-Photo)'}
                  </h2>
                  {isEdit && (
                    <span className="font-mono text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[#DFBD76]/30 border border-[#DFBD76]/50 text-[#DFBD76] font-bold">
                      {sku}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#E0E7E5] truncate">
                  {isEdit 
                    ? 'Update photos, sizing specifications, status, and confidential costing'
                    : 'Upload local photos via Cloudinary or web URLs, set Instagram link, and configure costing'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all active:scale-90 flex-shrink-0 flex items-center justify-center"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body - Smooth Scrollable Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Multi-Photo Manager Box */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-[#FAF8F5] dark:bg-[#041A17] p-4 rounded-2xl border transition-all space-y-3 ${
              isDraggingOver
                ? 'border-[#DFBD76] ring-2 ring-[#DFBD76]/30 bg-[#DFBD76]/5'
                : 'border-[#EADFC9] dark:border-[#1A3E38]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-[#084C42] dark:text-[#DFBD76] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Photo Showcase ({photoInputs.length}/{MAX_PHOTOS} Angles)</span>
              </span>
              <span className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
                Select or drop multiple photos at once
              </span>
            </div>

            {/* Photo Thumbnails Preview Grid with Sequence Controls & Drag-Drop */}
            {photoInputs.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {photoInputs.map((url, idx) => {
                    const isCover = idx === 0;
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handlePhotoDragStart(e, idx)}
                        onDragOver={handlePhotoDragOver}
                        onDrop={(e) => handlePhotoDrop(e, idx)}
                        className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all shadow-sm cursor-grab active:cursor-grabbing group select-none ${
                          isCover
                            ? 'border-[#DFBD76] ring-2 ring-[#DFBD76]/40 bg-[#DFBD76]/10'
                            : 'border-[#EADFC9] dark:border-[#1A3E38] hover:border-[#DFBD76]/70'
                        }`}
                      >
                        {/* Image */}
                        <img src={url} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />

                        {/* Top Bar: Cover Badge or "Make 1st" Button + Delete */}
                        <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between gap-1 pointer-events-auto">
                          {isCover ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#DFBD76] text-stone-950 font-extrabold text-[10px] shadow-md">
                              <Crown className="w-3 h-3 text-stone-950" />
                              <span>1st (Cover)</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakeCover(idx);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 hover:bg-[#DFBD76] text-[#DFBD76] hover:text-stone-950 text-[10px] font-bold shadow-md transition-all backdrop-blur-sm active:scale-95 cursor-pointer"
                              title="Move to 1st position (Set as Cover Photo)"
                            >
                              <Crown className="w-3 h-3" />
                              <span>Make 1st</span>
                            </button>
                          )}

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(idx);
                            }}
                            className="p-1 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition-all shadow-md active:scale-90 ml-auto cursor-pointer"
                            title="Remove Photo"
                            aria-label="Remove Photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom Reordering Nav Strip: [<] [#Position] [>] */}
                        <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between px-1.5 py-0.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-[10px] shadow-sm pointer-events-auto">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMovePhoto(idx, idx - 1);
                            }}
                            className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                            title="Move left (previous position)"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-extrabold text-[10px] text-[#DFBD76]">
                            #{idx + 1}
                          </span>

                          <button
                            type="button"
                            disabled={idx === photoInputs.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMovePhoto(idx, idx + 1);
                            }}
                            className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                            title="Move right (next position)"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#9BB5AF] pt-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#DFBD76] flex-shrink-0" />
                    <span>Click <strong>Make 1st</strong>, use arrows <strong>&lt; / &gt;</strong>, or drag photos to change order.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#084C42] dark:text-[#DFBD76] font-bold underline hover:opacity-80 cursor-pointer"
                  >
                    + Add More Photos
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer py-6 px-4 rounded-2xl border-2 border-dashed transition-all text-center space-y-1.5 group ${
                  isDraggingOver
                    ? 'border-[#DFBD76] bg-[#DFBD76]/15 scale-[1.01]'
                    : 'border-[#DFBD76]/50 bg-[#DFBD76]/5 hover:bg-[#DFBD76]/10 hover:border-[#DFBD76]'
                }`}
              >
                <Upload className="w-6 h-6 text-[#DFBD76] mx-auto opacity-90 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-[#084C42] dark:text-[#DFBD76] group-hover:underline">
                  Click to select multiple photos, or drag & drop files here
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Hold Shift or Cmd/Ctrl to choose multiple photos at the same time.
                </p>
              </div>
            )}

            {/* Add Photo Controls: Local Multi-File Upload & Web URL */}
            {photoInputs.length < MAX_PHOTOS && (
              <div className="space-y-2 pt-1">
                {/* Hidden File Input supporting MULTIPLE file selection */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Multi-Photo Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/40 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-60 shadow-sm"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#DFBD76]" />
                        <span>{uploadProgressText || 'Uploading photos to Cloudinary...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#DFBD76]" />
                        <span>Upload Photos (Select Multiple)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhotoUrl();
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-xs text-[#1C1917] dark:text-[#FAF6EC] focus:outline-none focus:border-[#DFBD76]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="py-2 px-3 rounded-xl bg-[#DFBD76] hover:bg-[#C5A059] text-[#041A17] font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleUsePlaceholderPhoto}
                      className="py-2 px-2.5 rounded-xl border border-[#DFBD76]/60 bg-[#DFBD76]/10 hover:bg-[#DFBD76]/20 text-[#084C42] dark:text-[#DFBD76] text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition-all"
                      title="Attach boutique logo as fallback photo"
                    >
                      <span>Use Logo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC]">
                  Choli SKU *
                </label>
                <button
                  type="button"
                  onClick={() => setSku(generateUniqueSku())}
                  className="text-[10px] text-[#084C42] dark:text-[#DFBD76] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  title="Generate Fresh Unique SKU"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>New SKU</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] font-mono text-sm text-[#084C42] dark:text-[#DFBD76] font-bold shadow-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC] block mb-1.5">
                Choli Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Noor Emerald Raw Silk Sangeet Choli"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-sm text-[#1C1917] dark:text-[#FAF6EC] shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <BoutiqueAutocomplete
                label="Category *"
                value={category}
                onChange={(val) => setCategory(val as CholiCategory)}
                options={CHOLI_CATEGORIES.map((cat) => ({
                  value: cat.value,
                  label: `${cat.label} Choli`,
                }))}
                placeholder="Select Category..."
              />
            </div>

            <div>
              <BoutiqueAutocomplete
                label="Status / Vault State *"
                value={status}
                onChange={(val) => setStatus(val as CholiStatus)}
                options={[
                  { value: 'AVAILABLE', label: 'Available (Ready for Rent)', badge: 'Available' },
                  { value: 'RENTED', label: 'Currently Rented', badge: 'Rented' },
                  { value: 'IN_ALTERATION', label: 'In Alteration / Tailoring', badge: 'Alteration' },
                  { value: 'AT_DRY_CLEANER', label: 'At Dry Cleaner', badge: 'Cleaning' },
                  { value: 'RETIRED', label: 'Archived / Retired', badge: 'Archived' },
                ]}
                placeholder="Select Status..."
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC] block mb-1.5">
                Primary Color(s) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deep Maroon & Antique Gold"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-sm text-[#1C1917] dark:text-[#FAF6EC] shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC] block mb-1.5">
                Fabric & Work
              </label>
              <input
                type="text"
                placeholder="e.g. Micro Velvet, Pure Zari & Dabka"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-sm text-[#1C1917] dark:text-[#FAF6EC] shadow-sm"
              />
            </div>

            <div>
              <BoutiqueAutocomplete
                label="Blouse Size & Alteration"
                value={blouseSize}
                onChange={(val) => setBlouseSize(val)}
                options={CHOLI_SIZES.map((s) => ({
                  value: s,
                  label: s,
                }))}
                placeholder="e.g. 36 (Alterable 34-38)"
                freeSolo={true}
                disableClearable={false}
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-[#1C1917] dark:text-[#FAF6EC] block mb-1.5">
                Skirt Length (inches)
              </label>
              <input
                type="number"
                value={skirtLength}
                onChange={(e) => setSkirtLength(Number(e.target.value))}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-sm text-[#1C1917] dark:text-[#FAF6EC] shadow-sm"
              />
            </div>
          </div>

          {/* Instagram Post URL Field */}
          <div>
            <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] flex items-center gap-1.5 mb-1">
              <InstagramIcon sx={{ fontSize: 16, color: '#E1306C' }} />
              <span>Instagram Post / Reel URL (Optional)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://www.instagram.com/p/..."
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full py-2 pl-3 pr-4 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC] focus:border-[#DFBD76]"
              />
            </div>
          </div>

          {/* Confidential Financial Costing Box */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#084C42] dark:text-[#DFBD76]">
                <DollarSign className="w-3.5 h-3.5" />
                <span>
                  {currentUser?.role === 'ADMIN' ? 'Admin Confidential: Costing & Rental Economics' : 'Boutique Rental Rates & Security Deposit'}
                </span>
              </div>
              {currentUser?.role !== 'ADMIN' && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Staff Access
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#084C42] dark:text-[#DFBD76] block mb-1">
                  Initial Costing (₹) {currentUser?.role === 'ADMIN' ? '*' : '(Optional)'}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder={currentUser?.role === 'ADMIN' ? 'e.g. 15000' : '0 (Optional for staff)'}
                  value={totalCosting}
                  onChange={(e) => setTotalCosting(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-emerald-300 dark:border-emerald-800 font-bold text-[#084C42] dark:text-[#DFBD76]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                  Rental Rate / Event (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 1499"
                  value={rentalPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val === '' ? '' : Math.max(0, Number(val));
                    setRentalPrice(num);
                    // If deposit has not been manually entered yet, suggest equal to rental price or 1.5x
                    if (securityDeposit === '' && typeof num === 'number' && num > 0) {
                      setSecurityDeposit(Math.round(num * 1.5));
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] font-bold text-[#15803D] dark:text-[#22C55E]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 2000"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] font-bold text-[#1C1917] dark:text-[#FAF6EC]"
                />
                <span className="text-[9px] text-[#084C42] dark:text-[#DFBD76] block mt-0.5 font-medium">
                  Customizable deposit (editable)
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                  Dry Clean Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={dryCleaningFee}
                  onChange={(e) => setDryCleaningFee(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#0A2E28] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
                />
              </div>
            </div>

            <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">
              🔒 <em>This costing will never be displayed to staff members or walk-in customers.</em>
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
              Choli Notes & Description
            </label>
            <textarea
              rows={2}
              placeholder="Intricate zardozi embroidery on choli kalis, matching latkans, velvet blouse..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
            />
          </div>

          </div>

          {/* Sticky Bottom Action Bar (Always visible at bottom) */}
          <div className="flex-shrink-0 bg-[#FAF8F5] dark:bg-[#041A17] px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-between gap-3 shadow-inner">
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-4 sm:px-5 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] text-[#78716C] dark:text-[#9BB5AF] hover:bg-stone-200 dark:hover:bg-[#0A2E28] font-bold text-xs sm:text-sm transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 sm:px-6 rounded-xl font-bold bg-gradient-to-r from-[#084C42] to-[#0D6357] text-white hover:opacity-95 shadow-md shadow-[#084C42]/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#DFBD76]" />
                  <span>Saving Changes...</span>
                </>
              ) : isEdit ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#DFBD76]" />
                  <span>Update Choli Details</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#DFBD76]" />
                  <span>Catalog Choli ({photoInputs.length} Photos)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
