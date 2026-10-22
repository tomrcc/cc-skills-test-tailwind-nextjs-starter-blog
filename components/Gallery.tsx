import Image from './Image'

interface GalleryImage {
  src: string
  alt?: string
}

// Images keep their natural size, capped at the column width.
export default function Gallery({ images }: { images: GalleryImage[] }) {
  return (
    <div className="-mx-2 flex flex-wrap overflow-hidden xl:-mx-2">
      {(images || []).map((image, index) => (
        <div key={index} className="my-1 w-full overflow-hidden px-2 xl:my-1 xl:w-1/2 xl:px-2">
          {image?.src && (
            <Image
              src={image.src}
              alt={image.alt || ''}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
