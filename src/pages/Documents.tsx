import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileIcon,
  MoreVertical,
  Layers
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  status: 'processing' | 'indexed' | 'failed';
  chunk_count: number;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(file => formData.append('files', file));

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Successfully uploaded ${acceptedFiles.length} files`);
      fetchDocuments();
    } catch (err: any) {
      toast.error('Upload failed');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? All associated reasoning data will be lost.')) return;
    try {
      await axios.delete(`/api/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || d.file_type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex-1 p-10 overflow-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Knowledge Base</h1>
            <p className="text-slate-500 mt-1 font-medium">Upload and manage documents for your research pipeline.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="TXT">TXT</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="indexed">Indexed</option>
              <option value="failed">Failed</option>
            </select>
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm w-48 lg:w-64"
              />
            </div>
          </div>
        </header>

        {/* Upload Zone */}
        <div 
          {...getRootProps()} 
          className={cn(
            "mb-12 border-2 border-dashed rounded-[32px] p-16 transition-all cursor-pointer flex flex-col items-center justify-center text-center",
            isDragActive ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 hover:border-slate-300 bg-white shadow-sm",
            isUploading && "opacity-50 pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center mb-6">
            <Upload className={cn("w-10 h-10", isDragActive ? "text-indigo-600" : "text-slate-400")} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isUploading ? "Indexing Documents..." : "Add your research context"}
          </h2>
          <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Drag files here to index them. Support for PDF, DOCX, and TXT (Max 10MB).</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <DocStat label="Total Documents" value={documents.length} />
          <DocStat label="Indexed Chunks" value={documents.reduce((acc, d) => acc + d.chunk_count, 0)} />
          <DocStat label="Processing" value={documents.filter(d => d.status === 'processing').length} />
          <DocStat label="Storage Used" value={`${(documents.reduce((acc, d) => acc + d.file_size, 0) / 1024 / 1024).toFixed(2)} MB`} />
        </div>

        {/* Documents Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
                <th className="px-8 py-5">Document Name</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Chunks</th>
                <th className="px-8 py-5">Added</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredDocs.map((doc) => (
                  <motion.tr 
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-0.5">{doc.filename}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{(doc.file_size / 1024).toFixed(1)} KB • {doc.file_type.split('/')[1]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight shadow-sm",
                        doc.status === 'indexed' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
                        doc.status === 'processing' ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-700 border border-red-100"
                      )}>
                        {doc.status === 'indexed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {doc.chunk_count}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[11px] font-semibold text-slate-400">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="py-24 text-center text-slate-300 italic font-medium flex flex-col items-center">
              <FileIcon className="w-12 h-12 mb-4 opacity-10" />
              <span>No documents indexed in your research pipeline.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocStat({ label, value }: { label: string, value: any }) {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}
