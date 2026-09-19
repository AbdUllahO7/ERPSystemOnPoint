import { Building2, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CompanyInformationTab() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center bg-gray-50 shrink-0">
            {/* Logo placeholder - using building icon as fallback */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 shadow-inner">
              <span className="font-bold text-xl">P</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
            <p className="text-sm text-gray-500 mt-1">
              Name, logo, address, commercial registration
            </p>
          </div>
        </div>
        <Button className="bg-[#0070E0] hover:bg-[#0070E0]/90 text-white font-medium px-6 h-11 shrink-0">
          Save Changes
        </Button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900">Basic company information</h3>
          <p className="text-sm text-gray-500 mt-1">This data appears on all documents and invoices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Company name (Arabic)</label>
            <Input placeholder="Company name (Arabic)" className="h-11 bg-transparent border-gray-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Company name (English)</label>
            <Input placeholder="Company name (English)" className="h-11 bg-transparent border-gray-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Tax ID number</label>
            <Input placeholder="Expense No" className="h-11 bg-transparent border-gray-200" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Commercial Registration Number</label>
            <Input placeholder="Commercial Registration Number" className="h-11 bg-transparent border-gray-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">E-mail</label>
            <Input type="email" placeholder="e-mail" className="h-11 bg-transparent border-gray-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Phone Number</label>
            <Input type="tel" placeholder="phone number" className="h-11 bg-transparent border-gray-200" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">State</label>
            <select className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0070E0]">
              <option value="">Select State</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-800">City</label>
            <select className="flex h-11 w-full rounded-md border border-gray-200 bg-transparent px-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0070E0]">
              <option value="">Select City</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-semibold text-gray-800">Full Adress</label>
            <Input placeholder="Full Adress" className="h-11 bg-transparent border-gray-200" />
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="mt-10">
          <button 
            type="button" 
            className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3 text-gray-800 font-semibold text-base mb-1">
              <UploadCloud className="w-6 h-6 text-gray-600 group-hover:text-[#0070E0] transition-colors" />
              Choose a file or drag & drop it here To Replace Logo
            </div>
            <p className="text-sm text-gray-400">
              JPEG, PNG & PDG formats, up to 50MB
            </p>
          </button>
        </div>
      </div>

    </div>
  );
}
