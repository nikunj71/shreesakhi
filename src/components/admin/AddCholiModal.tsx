'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addCholi, createCholiApi, updateCholiApi } from '@/store/choliSlice';
import { Choli, CholiCategory, CholiStatus } from '@/types';
import { APP_CONFIG, CHOLI_CATEGORIES, CHOLI_SIZES } from '@/constants';
import { X, Sparkles, Plus, Image as ImageIcon, DollarSign, Trash2, Layers, Upload, Loader2, Link as LinkIcon, Edit3, CheckCircle2 } from 'lucide-react';
import InstagramIcon from '@mui/icons-material/Instagram';
import { toast } from 'sonner';

interface AddCholiModalProps {
  isOpen: boolean;
  onClose: () => void;
  choliToEdit?: Choli | null;
}

export function AddCholiModal({ isOpen, onClose, choliToEdit }: AddCholiModalProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);

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
  
  // Multi-Photo Management State (Starts completely empty - NO default photos)
  const [photoInputs, setPhotoInputs] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial Costing (ADMIN ONLY) - Clean initial state
  const [totalCosting, setTotalCosting] = useState<number | ''>('');
  const [rentalPrice, setRentalPrice] = useState<number | ''>('');
  const [securityDeposit, setSecurityDeposit] = useState<number | ''>('');
  const [dryCleaningFee, setDryCleaningFee] = useState<number | ''>(250);
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
      setTotalCosting(choliToEdit.totalCosting ?? '');
      setRentalPrice(choliToEdit.rentalPricePerEvent ?? '');
      setSecurityDeposit(choliToEdit.securityDeposit ?? '');
      setDryCleaningFee(choliToEdit.dryCleaningFee ?? 250);
      setDescription(choliToEdit.description || '');
      setStatus(choliToEdit.status || 'AVAILABLE');
    } else {
      setSku(`SK-${Math.floor(100 + Math.random() * 900)}`);
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
      setTotalCosting('');
      setRentalPrice('');
      setSecurityDeposit('');
      setDryCleaningFee(250);
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

  if (!isOpen) return null;

  // Block if not Admin
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#072622] p-6 rounded-2xl max-w-sm text-center space-y-3 border border-[#EADFC9] dark:border-[#1A3E38]">
          <p className="font-bold text-red-600">Access Restricted</p>
          <p className="text-xs text-stone-500 dark:text-[#9BB5AF]">Only Admin can catalog new cholis and configure wholesale costing.</p>
          <button onClick={onClose} className="py-2 px-4 rounded-xl bg-stone-200 dark:bg-[#0A2E28] text-xs font-bold text-stone-800 dark:text-[#FAF6EC]">
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    if (photoInputs.length >= 6) {
      toast.warning('Maximum 6 photos allowed per choli.');
      return;
    }
    setPhotoInputs([...photoInputs, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
    toast.success('Photo added to showcase preview');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photoInputs.length >= 6) {
      toast.warning('Maximum 6 photos allowed per choli.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setPhotoInputs((prev) => [...prev, data.url]);
      toast.success('Photo uploaded to Cloudinary!', {
        description: 'Image saved to Cloudinary CDN; URL will be stored in database.'
      });
    } catch (err: any) {
      console.error('File upload failed:', err);
      toast.error(err.message || 'Error uploading photo');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotoInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !color.trim() || rentalPrice === '' || totalCosting === '') {
      toast.error('Please fill in all mandatory choli details (Name, Color, Wholesale Cost, Rental Rate).');
      return;
    }

    if (photoInputs.length === 0) {
      toast.error('Please upload or add at least one photo for the choli showcase.');
      return;
    }

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
          images: photoInputs,
          totalCosting: Number(totalCosting),
          rentalPricePerEvent: Number(rentalPrice),
          securityDeposit: Number(securityDeposit || 0),
          dryCleaningFee: Number(dryCleaningFee || 0),
          status,
          description: description.trim() || `${name.trim()} - handcrafted designer choli with intricate artistry.`,
          instagramUrl: instagramUrl.trim() || undefined,
          isBreakEvenReached: (choliToEdit.totalEarnedFromRent || 0) >= Number(totalCosting),
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
          images: photoInputs,
          totalCosting: Number(totalCosting),
          rentalPricePerEvent: Number(rentalPrice),
          securityDeposit: Number(securityDeposit || 0),
          dryCleaningFee: Number(dryCleaningFee || 0),
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
        toast.success(`Choli "${sku}" successfully cataloged with ${photoInputs.length} photos!`);
      }
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error saving choli:', err);
      toast.error(err.message || 'Failed to save choli details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#072622] rounded-3xl border border-[#EADFC9] dark:border-[#1A3E38] shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#DFBD76]/20 border border-[#DFBD76]/40 flex items-center justify-center text-[#DFBD76]">
              {isEdit ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold">
                  {isEdit ? 'Edit Choli Details' : 'Catalog New Choli (Multi-Photo)'}
                </h2>
                {isEdit && (
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#DFBD76]/30 border border-[#DFBD76]/50 text-[#DFBD76] font-bold">
                    {sku}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#E0E7E5]">
                {isEdit 
                  ? 'Update photos, sizing specifications, status, and confidential costing'
                  : 'Upload local photos via Cloudinary or web URLs, set Instagram link, and configure costing'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
          
          {/* Multi-Photo Manager Box */}
          <div className="bg-[#FAF8F5] dark:bg-[#041A17] p-4 rounded-2xl border border-[#EADFC9] dark:border-[#1A3E38] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-[#084C42] dark:text-[#DFBD76] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Photo Showcase ({photoInputs.length}/6 Angles)</span>
              </span>
              <span className="text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
                Front, Back, Flare, Dupatta, Details
              </span>
            </div>

            {/* Photo Thumbnails Preview Grid */}
            {photoInputs.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {photoInputs.map((url, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#DFBD76] group shadow-sm">
                    <img src={url} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-bold backdrop-blur-sm">
                      #{idx + 1} {idx === 0 ? '(Cover)' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-md active:scale-90"
                      title="Remove Photo"
                      aria-label="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 px-4 rounded-2xl border-2 border-dashed border-[#DFBD76]/50 bg-[#DFBD76]/5 text-center space-y-1.5">
                <Upload className="w-6 h-6 text-[#DFBD76] mx-auto opacity-90" />
                <p className="text-xs font-bold text-[#084C42] dark:text-[#DFBD76]">
                  No default photos — add your outfit photos
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Upload photos from your device (saved to Cloudinary) or paste image URLs below.
                </p>
              </div>
            )}

            {/* Add Photo Controls: Local File Upload & Web URL */}
            {photoInputs.length < 6 && (
              <div className="space-y-2 pt-1">
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Local Photo Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#084C42] to-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/40 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-60"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#DFBD76]" />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#DFBD76]" />
                        <span>Upload Local Photo</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Choli SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] font-mono text-[#084C42] dark:text-[#DFBD76] font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Choli Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Noor Emerald Raw Silk Sangeet Choli"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CholiCategory)}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
              >
                {CHOLI_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} Choli
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Status / Vault State *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CholiStatus)}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#084C42] dark:text-[#DFBD76] font-bold"
              >
                <option value="AVAILABLE">Available (Ready for Rent)</option>
                <option value="RENTED">Currently Rented</option>
                <option value="IN_ALTERATION">In Alteration / Tailoring</option>
                <option value="AT_DRY_CLEANER">At Dry Cleaner</option>
                <option value="RETIRED">Archived / Retired</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Primary Color(s) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deep Maroon & Antique Gold"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Fabric & Work
              </label>
              <input
                type="text"
                placeholder="e.g. Micro Velvet, Pure Zari & Dabka"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Blouse Size & Alteration
              </label>
              <input
                type="text"
                placeholder="e.g. 36 (Alterable 34-38)"
                value={blouseSize}
                onChange={(e) => setBlouseSize(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1C1917] dark:text-[#FAF6EC] block mb-1">
                Skirt Length (inches)
              </label>
              <input
                type="number"
                value={skirtLength}
                onChange={(e) => setSkirtLength(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#041A17] border border-[#EADFC9] dark:border-[#1A3E38] text-[#1C1917] dark:text-[#FAF6EC]"
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

          {/* Confidential Financial Costing Box (STRICTLY ADMIN ONLY) */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-3">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#084C42] dark:text-[#DFBD76]">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Admin Confidential: Costing & Rental Economics</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#084C42] dark:text-[#DFBD76] block mb-1">
                  Initial Costing (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 15000"
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
                  placeholder="e.g. 250"
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#EADFC9] dark:border-[#1A3E38] text-[#78716C] dark:text-[#9BB5AF] hover:bg-[#FAF8F5] dark:hover:bg-[#0A2E28] font-semibold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-[#084C42] to-[#0D6357] text-white hover:opacity-95 shadow-lg shadow-[#084C42]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
