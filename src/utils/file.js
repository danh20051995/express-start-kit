import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const { COPYFILE_EXCL } = fs.constants

const move = (oldPath = '', newPath = '') => {
  fs.renameSync(oldPath, newPath)
  return newPath
}

const exist = filePath => fs.existsSync(filePath)

const getContent = filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        reject(err)
      }

      resolve(content)
    })
  })
}

const deleteFile = filePath => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, err => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      })
    } else {
      resolve()
    }
  })
}

const deleteDirectory = (dir) => {
  return new Promise((resolve, reject) => {
    let cmd
    if (process.platform === 'win32') {
      // Work on windows
      cmd = `rmdir ${dir} /s /q`
    } else {
      cmd = `rm -rf ${dir}`
    }

    exec(cmd, { maxBuffer: 1000000 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

const deleteDirectories = async (dirs) => {
  for (const dir of dirs) {
    await deleteDirectory(dir)
  }
}

const copySync = (filePath, copyFilePath, replace = false) => {
  // COPYFILE_EXCL the operation will fail if copyFilePath exists
  return fs.copyFileSync(filePath, copyFilePath, replace ? 0 : COPYFILE_EXCL)
}

const copyAsync = (filePath, copyFilePath, replace = false) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(filePath, copyFilePath, replace ? 0 : COPYFILE_EXCL, err => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}

const ensureDirExists = directory => {
  return !directory
    .replace(global.BASE_PATH, '')
    .split(/\\|\//)
    .reduce(({ fullPath, notEnsure }, part, index, paths) => {
      if (part) {
        fullPath = path.join(fullPath, part)
      }
      return {
        fullPath,
        notEnsure: !fs.existsSync(fullPath) && fs.mkdirSync(fullPath)
      }
    }, { fullPath: global.BASE_PATH, notEnsure: false })
    .notEnsure
}

export default {
  move,
  exist,
  copy: copySync,
  copySync,
  copyAsync,
  getContent,
  delete: deleteFile,
  deleteFile,
  ensureDirExists,
  deleteDirectory,
  deleteDirectories
}
