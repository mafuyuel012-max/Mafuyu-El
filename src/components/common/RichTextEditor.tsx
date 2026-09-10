import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  Code,
  Eye,
  PenLine,
  Upload,
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import { MediaItem } from '../../types';
import { useToast } from './Toast';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tuliskan isi berita atau konten di sini...',
}) => {
  const toast = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'html' | 'preview'>('editor');
  const [htmlContent, setHtmlContent] = useState(value || '');

  // Synchronize internal state with external value
  useEffect(() => {
    if (editorRef.current && viewMode === 'editor') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setHtmlContent(value || '');
  }, [value, viewMode]);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange(newHtml);
    }
  }, [onChange]);

  // Save selection range inside the editor
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleEditorInput();
    saveSelection();
  };

  const handleAddLink = () => {
    saveSelection();
    const url = prompt('Masukkan tautan URL (contoh: https://kemdikbud.go.id):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleOpenMediaPicker = () => {
    saveSelection();
    setIsMediaPickerOpen(true);
  };

  // Safe DOM insertion at caret or at the end of content
  const insertHtmlContent = (htmlToInsert: string) => {
    if (viewMode === 'html') {
      const newHtml = htmlContent ? `${htmlContent}\n\n${htmlToInsert}` : htmlToInsert;
      setHtmlContent(newHtml);
      onChange(newHtml);
      toast.success('Media berhasil disisipkan ke kode HTML.');
      return;
    }

    if (viewMode === 'preview') {
      setViewMode('editor');
    }

    // Ensure editor element is ready
    const editor = editorRef.current;
    if (!editor) {
      const fallback = (value || '') + htmlToInsert;
      onChange(fallback);
      toast.success('Media berhasil disisipkan.');
      return;
    }

    editor.focus();
    const sel = window.getSelection();
    let range: Range | null = savedRangeRef.current;

    // Check if saved range is valid and inside editor
    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false); // place cursor at end
    }

    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Insert DOM Fragment cleanly
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlToInsert;
    const fragment = document.createDocumentFragment();
    let node: Node | null;
    let lastNode: Node | null = null;
    while ((node = tempDiv.firstChild)) {
      lastNode = fragment.appendChild(node);
    }

    range.deleteContents();
    range.insertNode(fragment);

    // Place caret right after inserted node
    if (lastNode && sel) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedRangeRef.current = newRange;
    }

    handleEditorInput();
    toast.success('Media berhasil disisipkan ke dalam berita.');
  };

  const handleMediaSelected = (media: MediaItem) => {
    let htmlSnippet = '';
    if (media.category === 'image') {
      htmlSnippet = `<figure class="my-4 text-center"><img src="${media.url}" alt="${media.original_name || 'Gambar Berita'}" class="rounded-xl max-w-full h-auto mx-auto shadow-sm" /><figcaption class="text-xs text-slate-500 mt-1.5">${media.original_name || ''}</figcaption></figure><p><br/></p>`;
    } else if (media.category === 'video') {
      htmlSnippet = `<div class="my-4"><video controls class="rounded-xl w-full aspect-video shadow-sm bg-black" src="${media.url}"></video><p class="text-xs text-slate-500 text-center mt-1.5">${media.original_name || ''}</p></div><p><br/></p>`;
    } else if (media.category === 'audio') {
      htmlSnippet = `<div class="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200"><p class="text-xs font-semibold text-slate-700 mb-1.5">🎵 ${media.original_name}</p><audio controls class="w-full" src="${media.url}"></audio></div><p><br/></p>`;
    } else {
      const fileSize = media.size ? `${(media.size / 1024).toFixed(0)} KB` : '';
      htmlSnippet = `<div class="my-3 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"><div class="flex items-center gap-3 min-w-0"><span class="text-2xl">📄</span><div class="truncate"><div class="font-semibold text-slate-800 text-sm truncate">${media.original_name}</div><div class="text-xs text-slate-500">${fileSize} • ${(media.extension || 'file').toUpperCase()}</div></div></div><a href="${media.url}" target="_blank" rel="noopener noreferrer" download class="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs">Unduh Berkas</a></div><p><br/></p>`;
    }

    insertHtmlContent(htmlSnippet);
    setIsMediaPickerOpen(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-sky-500 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/80 border-b border-slate-200 text-slate-700">
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<p>')}
          className="p-1.5 hover:bg-slate-200 rounded text-xs font-bold transition-colors"
          title="Paragraf Normal"
        >
          P
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors font-bold"
          title="Tebal (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Miring (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Garis Bawah (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Daftar Poin"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Daftar Nomor"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Kutipan (Quote)"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Rata Kiri"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Rata Tengah"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Rata Kanan"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={handleAddLink}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
          title="Sisipkan Tautan"
        >
          <LinkIcon className="w-4 h-4 text-sky-600" />
        </button>

        {/* Sisipkan Media Button */}
        <button
          type="button"
          onClick={handleOpenMediaPicker}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-sky-100 text-sky-700 bg-sky-50 border border-sky-200 rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
          title="Sisipkan Gambar, Video, atau Dokumen dari Pustaka Media"
        >
          <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
          <span>Sisipkan Media</span>
        </button>

        {/* View mode toggle */}
        <div className="ml-auto flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'editor' ? 'bg-white text-slate-800 shadow-xs font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenLine className="w-3.5 h-3.5 inline mr-1" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'html' ? 'bg-white text-slate-800 shadow-xs font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 inline mr-1" />
            HTML
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'preview' ? 'bg-white text-slate-800 shadow-xs font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor Content Box */}
      {viewMode === 'editor' && (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onFocus={saveSelection}
          className="p-5 min-h-[320px] max-h-[600px] overflow-y-auto focus:outline-hidden prose prose-slate max-w-none text-slate-800 leading-relaxed"
          style={{ wordBreak: 'break-word' }}
          data-placeholder={placeholder}
        />
      )}

      {viewMode === 'html' && (
        <textarea
          value={htmlContent}
          onChange={(e) => {
            setHtmlContent(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full p-4 font-mono text-xs text-slate-100 min-h-[320px] focus:outline-hidden bg-slate-900 resize-y"
          placeholder="Kode HTML konten..."
        />
      )}

      {viewMode === 'preview' && (
        <div className="p-6 min-h-[320px] max-h-[600px] overflow-y-auto bg-slate-50/50">
          <div
            className="prose prose-slate max-w-none bg-white p-6 rounded-xl border border-slate-200 shadow-xs"
            dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-slate-400 italic">Konten masih kosong.</p>' }}
          />
        </div>
      )}

      {/* Universal Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelected}
        allowedCategory="all"
        title="Pilih Media untuk Disisipkan ke Berita"
      />
    </div>
  );
};
