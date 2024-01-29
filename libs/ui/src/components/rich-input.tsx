import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Code,
  CodeBlock,
  HighlighterCircle,
  Image as ImageIcon,
  KeyReturn,
  LinkSimple,
  ListBullets,
  ListNumbers,
  Minus,
  Paragraph,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  TextAUnderline,
  TextB,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextIndent,
  TextItalic,
  TextOutdent,
  TextStrikethrough,
} from "@phosphor-icons/react";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@reactive-resume/utils";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Editor, EditorContent, EditorContentProps, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { forwardRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import { Popover, PopoverContent } from "./popover";
import { Skeleton } from "./skeleton";
import { Toggle } from "./toggle";
import { Tooltip } from "./tooltip";

const InsertImageFormSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
});

type InsertImageFormValues = z.infer<typeof InsertImageFormSchema>;

type InsertImageProps = {
  onInsert: (value: InsertImageFormValues) => void;
};

const InsertImageForm = ({ onInsert }: InsertImageProps) => {
  const form = useForm<InsertImageFormValues>({
    resolver: zodResolver(InsertImageFormSchema),
    defaultValues: { src: "", alt: "" },
  });

  const onSubmit = (values: InsertImageFormValues) => {
    onInsert(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <p className="prose prose-sm prose-zinc dark:prose-invert">
          Insert an image from an external URL and use it on your resume.
        </p>

        <FormField
          name="src"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="http://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="alt"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="!mt-5 ml-auto max-w-fit">
          <Button type="submit" variant="secondary" size="sm">
            Insert Image
          </Button>
        </div>
      </form>
    </Form>
  );
};

const InsertLinkFormSchema = z.object({
  url: z.string(),
  displayText: z.string(),
});

type InsertLinkFormValues = z.infer<typeof InsertLinkFormSchema>;

type InsertLinkProps = {
  onInsert: (value: InsertLinkFormValues) => void;
  editor: Editor;
};

const InsertLinkForm = ({ onInsert, editor }: InsertLinkProps) => {
  const previousUrl = editor.getAttributes("link").href;
  if (previousUrl) {
    // If the current selection contains a link, then select the whole text
    // to ensure the full displayText associated with the link is editable
    editor.commands.extendMarkRange("link");
  }
  const displayText = editor.state.doc.textBetween(
    editor.view.state.selection.from,
    editor.view.state.selection.to,
    " ",
  );
  const form = useForm<InsertLinkFormValues>({
    resolver: zodResolver(InsertLinkFormSchema),
    // Defaulting to "https://" to save the user from having to type it
    defaultValues: { url: previousUrl || "https://", displayText },
  });

  const onSubmit = (values: InsertLinkFormValues) => {
    onInsert(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          name="url"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="http://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="displayText"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Text</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="!mt-5 ml-auto max-w-fit">
          <Button type="submit" variant="secondary" size="sm">
            Insert Link
          </Button>
        </div>
      </form>
    </Form>
  );
};

const Toolbar = ({ editor }: { editor: Editor }) => {
  const setLink = useCallback(
    (url: string, displayText: string) => {
      const { from, to } = editor.view.state.selection;
      // empty
      if (url === "") {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .unsetLink()
          .insertContentAt({ from, to }, displayText)
          .run();

        return;
      }

      // No text was previously selected, so add new text
      if (from === to) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .command(({ tr }) => {
            tr.insertText(displayText);
            return true;
          })
          .run();
      } else {
        // Text was selected, so replace the selected text with the displayText input
        editor
          .chain()
          .insertContentAt({ from, to }, displayText)
          .setTextSelection({ from, to: from + displayText.length })
          .extendMarkRange("link")
          .setLink({ href: url })
          .focus()
          .run();
      }
    },
    [editor],
  );

  return (
    <div className="flex flex-wrap gap-0.5 border p-1">
      <Tooltip content="Bold">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <TextB />
        </Toggle>
      </Tooltip>

      <Tooltip content="Italic">
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <TextItalic />
        </Toggle>
      </Tooltip>

      <Tooltip content="Strikethrough">
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <TextStrikethrough />
        </Toggle>
      </Tooltip>

      <Tooltip content="Underline">
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <TextAUnderline />
        </Toggle>
      </Tooltip>

      <Tooltip content="Highlight">
        <Toggle
          size="sm"
          pressed={editor.isActive("highlight")}
          disabled={!editor.can().chain().focus().toggleHighlight().run()}
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        >
          <HighlighterCircle />
        </Toggle>
      </Tooltip>

      <Popover>
        <Tooltip content="Hyperlink">
          <PopoverTrigger asChild>
            <Button type="button" size="sm" variant="ghost" className="px-2">
              <LinkSimple />
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent className="w-80">
          <InsertLinkForm
            onInsert={(props) => {
              const { url, displayText } = props;
              setLink(url, displayText);
            }}
            editor={editor}
          />
        </PopoverContent>
      </Popover>

      <Tooltip content="Inline Code">
        <Toggle
          size="sm"
          pressed={editor.isActive("code")}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
        >
          <Code />
        </Toggle>
      </Tooltip>

      <Tooltip content="Code Block">
        <Toggle
          size="sm"
          pressed={editor.isActive("codeBlock")}
          disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
          onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <CodeBlock />
        </Toggle>
      </Tooltip>

      <Tooltip content="Heading 1">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <TextHOne />
        </Toggle>
      </Tooltip>

      <Tooltip content="Heading 2">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <TextHTwo />
        </Toggle>
      </Tooltip>

      <Tooltip content="Heading 3">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <TextHThree />
        </Toggle>
      </Tooltip>

      <Tooltip content="Paragraph">
        <Toggle
          size="sm"
          pressed={editor.isActive("paragraph")}
          onPressedChange={() => editor.chain().focus().setParagraph().run()}
        >
          <Paragraph />
        </Toggle>
      </Tooltip>

      <Tooltip content="Align Left">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "left" })}
          disabled={!editor.can().chain().focus().setTextAlign("left").run()}
          onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <TextAlignLeft />
        </Toggle>
      </Tooltip>

      <Tooltip content="Align Center">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "center" })}
          disabled={!editor.can().chain().focus().setTextAlign("center").run()}
          onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <TextAlignCenter />
        </Toggle>
      </Tooltip>

      <Tooltip content="Align Right">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "right" })}
          disabled={!editor.can().chain().focus().setTextAlign("right").run()}
          onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <TextAlignRight />
        </Toggle>
      </Tooltip>

      <Tooltip content="Align Justify">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "justify" })}
          disabled={!editor.can().chain().focus().setTextAlign("justify").run()}
          onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <TextAlignJustify />
        </Toggle>
      </Tooltip>

      <Tooltip content="Bullet List">
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBullets />
        </Toggle>
      </Tooltip>

      <Tooltip content="Numbered List">
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListNumbers />
        </Toggle>
      </Tooltip>

      <Tooltip content="Outdent">
        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
          disabled={!editor.can().chain().focus().liftListItem("listItem").run()}
        >
          <TextOutdent />
        </Button>
      </Tooltip>

      <Tooltip content="Indent">
        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
          disabled={!editor.can().chain().focus().sinkListItem("listItem").run()}
        >
          <TextIndent />
        </Button>
      </Tooltip>

      <Popover>
        <Tooltip content="Insert Image">
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="px-2">
              <ImageIcon />
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent className="w-80">
          <InsertImageForm onInsert={(props) => editor.chain().focus().setImage(props).run()} />
        </PopoverContent>
      </Popover>

      <Tooltip content="Insert Break Line">
        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          onClick={() => editor.chain().focus().setHardBreak().run()}
          disabled={!editor.can().chain().focus().setHardBreak().run()}
        >
          <KeyReturn />
        </Button>
      </Tooltip>

      <Tooltip content="Insert Horizontal Rule">
        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={!editor.can().chain().focus().setHorizontalRule().run()}
        >
          <Minus />
        </Button>
      </Tooltip>

      <Tooltip content="Undo">
        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <ArrowCounterClockwise />
        </Button>
      </Tooltip>

      <Tooltip content="Redo">
        <Button
          size="sm"
          variant="ghost"
          className="px-2"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <ArrowClockwise />
        </Button>
      </Tooltip>
    </div>
  );
};

interface RichInputProps
  extends Omit<
    EditorContentProps,
    "ref" | "editor" | "content" | "value" | "onChange" | "className"
  > {
  content?: string;
  onChange?: (value: string) => void;
  hideToolbar?: boolean;
  className?: string;
  editorClassName?: string;
  footer?: (editor: Editor) => React.ReactNode;
}

export const RichInput = forwardRef<Editor, RichInputProps>(
  (
    { content, onChange, footer, hideToolbar = false, className, editorClassName, ...props },
    _ref,
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Image,
        Underline,
        Highlight,
        Link.extend({ inclusive: false }).configure({ openOnClick: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm prose-zinc max-h-[200px] max-w-none overflow-y-scroll dark:prose-invert focus:outline-none [&_*]:my-2",
            editorClassName,
          ),
        },
      },
      content,
      parseOptions: { preserveWhitespace: "full" },
      onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    });

    if (!editor) {
      return (
        <div className="space-y-2">
          <Skeleton className={cn("h-[42px] w-full", hideToolbar && "hidden")} />
          <Skeleton className="h-[90px] w-full" />
        </div>
      );
    }

    return (
      <div>
        {!hideToolbar && <Toolbar editor={editor} />}

        <EditorContent
          editor={editor}
          className={cn(
            "grid min-h-[160px] w-full rounded-sm border bg-transparent px-3 py-2 text-sm placeholder:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            hideToolbar && "pt-2",
            className,
          )}
          {...props}
        />

        {footer?.(editor)}
      </div>
    );
  },
);

RichInput.displayName = "RichInput";
