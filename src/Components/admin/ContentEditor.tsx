import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

type ContentEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

const ContentEditor = ({ value, onChange }: ContentEditorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!quillRef.current && containerRef.current) {
      quillRef.current = new Quill(containerRef.current, {
        theme: "snow",
        placeholder: "Write your post...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            ["link", "image"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
          ],
        },
      });

      // Image handler: pick a local image and insert as data URL
      const toolbar = (quillRef.current as any).getModule("toolbar");
      toolbar?.addHandler("image", () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.onchange = () => {
          const file = (input.files && input.files[0]) || null;
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const editor = quillRef.current;
            if (!editor) return;
            const range = editor.getSelection(true);
            const dataUrl = reader.result as string;
            const insertIndex = range ? range.index : editor.getLength();
            editor.insertEmbed(insertIndex, "image", dataUrl, "user");
            editor.setSelection(insertIndex + 1, 0, "silent");
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });

      if (value) {
        const delta = quillRef.current.clipboard.convert({ html: value });
        quillRef.current.setContents(delta, "silent");
      }
    }

    const editor = quillRef.current!;
    const handleChange = () => {
      const html =
        (editor as any)?.getSemanticHTML?.() ||
        (editor as any)?.root?.innerHTML ||
        "";
      onChange(html);
    };
    editor.on("text-change", handleChange);
    return () => {
      editor.off("text-change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;
    const currentHtml =
      (quillRef.current as any)?.getSemanticHTML?.() ||
      (quillRef.current as any)?.root?.innerHTML ||
      "";
    if (value !== currentHtml) {
      const delta = quillRef.current.clipboard.convert({ html: value || "" });
      quillRef.current.setContents(delta, "silent");
    }
  }, [value]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        ref={containerRef}
        className="min-h-[300px] mb-4"
        data-testid="content-editor"
      />
    </div>
  );
};

export default ContentEditor;
