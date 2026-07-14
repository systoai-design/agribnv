import re

with open("src/pages/PropertyDetails.tsx", "r") as f:
    content = f.read()

# Remove -mt-16 and add safe-area-pt
content = content.replace(
    '<div className="md:hidden relative -mt-16">',
    '<div className="md:hidden relative safe-area-pt">'
)

# Add "View all photos" button
# The overlay is currently dots and counter:
old_overlay = """
            {/* Image counter */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md z-10 pointer-events-none">
              {currentImageIndex + 1} / {imageUrls.length}
            </div>
          </>
"""

new_overlay = """
            {/* Image counter & View all button */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>
              <button 
                onClick={() => setShowAllPhotos(true)}
                className="bg-white/90 text-black text-xs font-medium px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition-transform"
              >
                View all
              </button>
            </div>
          </>
"""
if old_overlay.strip() in content:
    content = content.replace(old_overlay.strip(), new_overlay.strip())
else:
    # Let's use regex if exact string mismatch
    pattern = re.compile(r'\{\/\* Image counter \*\/\}.*?<\/div>.*?<\/>', re.DOTALL)
    content = pattern.sub(new_overlay.strip(), content)


# Change <PhotoGalleryModal images={imageUrls} /> to images={images}
# Wait, images might be empty. `images={property.images || []}`
content = content.replace(
    '<PhotoGalleryModal\n        isOpen={showAllPhotos}',
    '<PhotoGalleryModal\n        isOpen={showAllPhotos}'
)
content = content.replace(
    'images={imageUrls}',
    'images={property.images && property.images.length > 0 ? property.images : imageUrls}'
)

with open("src/pages/PropertyDetails.tsx", "w") as f:
    f.write(content)
