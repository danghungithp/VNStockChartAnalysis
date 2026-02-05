
/**
 * Fetches an image from a URL and converts it to a base64 string.
 * Note: This requires a CORS proxy to work on the client-side for most image URLs.
 * @param url The URL of the image to fetch.
 * @returns A Promise that resolves with the base64 encoded image string.
 */
export const imageUrlToBase64 = (url: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result is a data URL: "data:image/png;base64,..."
        // We need to extract just the base64 part.
        const base64String = (reader.result as string).split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Failed to read base64 string from image blob."));
        }
      };
      reader.onerror = () => {
        reject(new Error("FileReader error while reading image blob."));
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error fetching or converting image:", error);
      reject(error);
    }
  });
};


/**
 * Converts a File object to a base64 string and its MIME type.
 * @param file The File object to convert.
 * @returns A Promise that resolves with an object containing the mimeType and base64 data.
 */
export const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [meta, base64Data] = result.split(',');
      const mimeTypeMatch = meta.match(/:(.*?);/);
      if (!base64Data || !mimeTypeMatch || !mimeTypeMatch[1]) {
        reject(new Error("Invalid file format or failed to read base64 data."));
        return;
      }
      resolve({ mimeType: mimeTypeMatch[1], data: base64Data });
    };
    reader.onerror = () => {
      reject(new Error("FileReader error while reading file."));
    };
    reader.readAsDataURL(file);
  });
};
