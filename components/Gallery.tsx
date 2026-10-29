interface GalleryImage {
  src?: string | null
  alt?: string | null
}

// A plain <img> keeps each image at its natural size, as the markdown images it replaces did;
// next/image would need dimensions the snippet doesn't store.
export default function Gallery({ images }: { images?: GalleryImage[] | null }) {
  return (
    <div className="-mx-2 flex flex-wrap overflow-hidden xl:-mx-2">
      {(images ?? []).map((image, index) => (
        <div key={index} className="my-1 w-full overflow-hidden px-2 xl:my-1 xl:w-1/2 xl:px-2">
          {image?.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.src} alt={image.alt ?? ''} loading="lazy" decoding="async" />
          )}
        </div>
      ))}
    </div>
  )
}
