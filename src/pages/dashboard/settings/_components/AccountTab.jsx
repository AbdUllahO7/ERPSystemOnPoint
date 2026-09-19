import { Camera, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccountTab() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      
      {/* Profile Picture Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-sm">
              <span className="text-3xl text-muted-foreground font-semibold">JD</span>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0070E0] text-white flex items-center justify-center border-2 border-background hover:bg-[#0070E0]/90 transition-colors shadow-sm"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a new avatar. Larger image will be resized automatically.<br/>
              Maximum upload size is <strong>2 MB</strong>.
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              <Button type="button" className="bg-[#0070E0] hover:bg-[#0070E0]/90">
                Upload New
              </Button>
              <Button type="button" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">First Name</label>
            <Input defaultValue="John" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Last Name</label>
            <Input defaultValue="Doe" className="h-11" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold">Job Title</label>
            <Input defaultValue="Senior Developer" className="h-11" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="button" className="bg-[#0070E0] hover:bg-[#0070E0]/90">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Email Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Email Address</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <Input defaultValue="john.doe@example.com" type="email" className="h-11 max-w-md" />
          </div>
          <p className="text-sm text-muted-foreground">
            We will send a verification email to your new address to confirm the change.
          </p>
          <div className="flex justify-end">
            <Button type="button" className="bg-[#0070E0] hover:bg-[#0070E0]/90">
              Update Email
            </Button>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Current Password</label>
            <Input type="password" placeholder="Enter current password" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">New Password</label>
            <Input type="password" placeholder="Enter new password" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Confirm New Password</label>
            <Input type="password" placeholder="Confirm new password" className="h-11" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="button" className="bg-[#0070E0] hover:bg-[#0070E0]/90">
            Change Password
          </Button>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-500 mb-2">Delete Account</h3>
        <p className="text-sm text-red-600/80 dark:text-red-400 mb-4">
          Permanently remove your account and all of its contents from our platform. This action is not reversible, so please continue with caution.
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="destructive" className="bg-red-600 hover:bg-red-700 font-semibold gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      </div>

    </div>
  );
}
