interface FeedbackContentProps {
  content: string[];
  coverImage?: string;
}

export default function Content({ content }: FeedbackContentProps) {
  return (
    <article className="space-y-8">
      <div className="prose prose-lg max-w-none">
        {content.map((paragraph, idx) => (
          <p key={idx} className="text-foreground mb-6 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
