import * as htmlToImage from 'html-to-image';

export async function exportPostsToDirectory(targetNodes: HTMLElement[], prefix: string = 'post') {
  if (!('showDirectoryPicker' in window)) {
    alert("Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera on desktop.");
    return;
  }

  try {
    // Request permission to write to a directory
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'downloads'
    });

    for (let i = 0; i < targetNodes.length; i++) {
      const node = targetNodes[i];
      // Generate image data URL
      const dataUrl = await htmlToImage.toPng(node, { quality: 1, pixelRatio: 1 });
      
      // Convert Data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create file in the selected directory
      const fileName = `${prefix}_${i + 1}.png`;
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      // Write blob to file
      await writable.write(blob);
      await writable.close();
    }

    alert(`Successfully saved ${targetNodes.length} images to the selected folder!`);
  } catch (error) {
    console.error("Export failed:", error);
    if ((error as Error).name !== 'AbortError') {
      alert("An error occurred during export. See console for details.");
    }
  }
}
