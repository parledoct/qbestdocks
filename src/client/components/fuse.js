import Fuse from 'fuse.js'

/* Define Fuse.js instance */
const options = {
    includeScore: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    threshold: 0.4,
    keys: ['upload_filename', 'annotation']
}
export const fuse = new Fuse([], options)
