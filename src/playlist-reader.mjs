import fs from 'fs/promises';

const mp3Filter = (file) => file.match(/\.mp3$/);

const safeReaddir = async (dir) => {
	try {
		return await fs.readdir(dir);
	} catch {
		return [];
	}
};

const reader = async () => {
	// get the listing of files in the main music folder
	const rawFiles = await safeReaddir('./server/music');
	// filter for mp3 files (exclude the default subdirectory)
	const files = rawFiles.filter(mp3Filter);

	// check for additional music files (volume-mountable directory)
	const addFiles = await safeReaddir('./server/add-music');
	const additionalFiles = addFiles.filter(mp3Filter).map((file) => `add-music/${file}`);

	// combine main + additional if either has files
	if (files.length > 0 || additionalFiles.length > 0) {
		return [...files, ...additionalFiles];
	}

	// fall back to the default folder
	const defaultFiles = await safeReaddir('./server/music/default');
	return defaultFiles.map((file) => `default/${file}`).filter(mp3Filter);
};

export default reader;
