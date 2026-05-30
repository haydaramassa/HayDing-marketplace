function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
  
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
  
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });
  }
  
  export async function getCroppedImageFile(imageSrc, pixelCrop, fileName = "profile-image.webp") {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    if (!context) {
      throw new Error("Could not prepare image crop.");
    }
  
    const size = Math.min(pixelCrop.width, pixelCrop.height);
  
    canvas.width = size;
    canvas.height = size;
  
    context.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );
  
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not crop image."));
            return;
          }
  
          resolve(new File([blob], fileName, { type: "image/webp" }));
        },
        "image/webp",
        0.92
      );
    });
  }