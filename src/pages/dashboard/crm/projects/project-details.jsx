import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Info, Plus, Trash2, Check, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            Project Details
            <Info className="w-4 h-4 text-muted-foreground" />
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/projects")}>Projects</span>
            <span>/</span>
            <span>Project Details</span>
          </div>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-blue-500 rounded-[20px] flex items-center justify-center text-white font-bold text-4xl shadow-sm">
            PN
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">Project Name</h3>
            <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">In Progress</span>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto w-full md:w-auto">
          <div className="flex-1 md:flex-none border border-purple-200 bg-purple-50 rounded-lg p-4 text-center min-w-[120px]">
            <p className="text-purple-600 text-sm mb-1 font-medium">Completion Rate</p>
            <p className="text-purple-600 font-semibold">50%</p>
          </div>
          <div className="flex-1 md:flex-none border border-emerald-200 bg-emerald-50 rounded-lg p-4 text-center min-w-[120px]">
            <p className="text-emerald-600 text-sm mb-1 font-medium">Start Date</p>
            <p className="text-emerald-600 font-semibold">23/7/2025</p>
          </div>
          <div className="flex-1 md:flex-none border border-red-200 bg-red-50 rounded-lg p-4 text-center min-w-[120px]">
            <p className="text-red-600 text-sm mb-1 font-medium">End Date</p>
            <p className="text-red-600 font-semibold">23/7/2026</p>
          </div>
          <div className="flex-1 md:flex-none border border-blue-200 bg-blue-50 rounded-lg p-4 text-center min-w-[120px]">
            <p className="text-blue-600 text-sm mb-1 font-medium">Tasks</p>
            <p className="text-blue-600 font-semibold">3</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Tasks</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Task 1 */}
              <div className="border rounded-xl p-4 flex gap-4">
                <div className="pt-1">
                  <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-foreground">User interface design</h4>
                      <p className="text-sm text-muted-foreground">Due June 21, 2026</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium">Scheduled</span>
                      <Select defaultValue="status">
                        <SelectTrigger className="w-32 h-9 text-sm">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="h-9 w-9 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm mb-1">Notes</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here' making it look like readable English. Many desktop publishing packages and web page editors now use Lorem
                    </p>
                  </div>
                </div>
              </div>

              {/* Task 2 */}
              <div className="border rounded-xl p-4 flex gap-4">
                <div className="pt-1">
                  <div className="w-10 h-10 rounded-full border border-emerald-500 bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-foreground">User interface design</h4>
                      <p className="text-sm text-muted-foreground">Due June 21, 2026</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-md text-xs font-medium">Completed</span>
                      <Button variant="outline" size="icon" className="h-9 w-9 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm mb-1">Notes</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here' making it look like readable English. Many desktop publishing packages and web page editors now use Lorem
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-6">
          {/* Files & Attachments */}
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Files & Attachments</h3>
            
            {/* File 1 */}
            <div className="border rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-12 bg-red-600 text-white rounded-[4px] rounded-tr-xl flex flex-col items-center justify-end pb-1 font-bold text-[10px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-800 rounded-bl-lg"></div>
                PDF
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Medical Insurance Card</p>
                <p className="text-xs text-muted-foreground mt-0.5">1.2 MB • Uploaded Mar 2022</p>
              </div>
            </div>

            {/* File 2 */}
            <div className="border rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-12 bg-blue-600 text-white rounded-[4px] rounded-tr-xl flex flex-col items-center justify-end pb-1 font-bold text-[10px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-3 h-3 bg-blue-800 rounded-bl-lg"></div>
                DOC
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Medical Insurance Card</p>
                <p className="text-xs text-muted-foreground mt-0.5">1.2 MB • Uploaded Mar 2022</p>
              </div>
            </div>

            {/* File 3 */}
            <div className="border rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-12 bg-emerald-600 text-white rounded-[4px] rounded-tr-xl flex flex-col items-center justify-end pb-1 font-bold text-[10px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-800 rounded-bl-lg"></div>
                CSV
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Medical Insurance Card</p>
                <p className="text-xs text-muted-foreground mt-0.5">1.2 MB • Uploaded Mar 2022</p>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2 border-dashed h-12 text-muted-foreground bg-gray-50/50 hover:bg-gray-50">
              <Plus className="w-4 h-4" />
              Upload File
            </Button>
          </div>

          {/* Contracts & Invoices */}
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-2">Contracts & Invoices</h3>
            
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">App Development Contract</span>
              </div>
              <span className="font-semibold text-blue-600 text-sm">$1300</span>
            </div>

            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">INV-312</span>
              </div>
              <span className="font-semibold text-blue-600 text-sm">$1300</span>
            </div>

            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">INV-312</span>
              </div>
              <span className="font-semibold text-blue-600 text-sm">$1300</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
