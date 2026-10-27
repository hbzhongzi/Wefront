import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/** 微信小程序正式打包产物中需剔除的静态目录（设计对照图 / 本地大图，避免撑爆主包） */
const EXCLUDE_FOLDERS = ['static/design', 'static/ignore']

/**
 * 仅执行 `uni build` 时，从产物中移除 static/design、static/ignore。
 * `uni -p` 开发态不注册/不删除，便于本地 VITE_IMAGE_HOST=/static/ignore 预览。
 * 注意：小程序 `dev:mp` 的 Vite command 也是 build，不能用 apply:'build' 区分，需看 argv。
 */
export default function excludeStaticFolders() {
  let outDir = ''

  return {
    name: 'exclude-static-folders',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      // uni.js：process.argv[2] === 'build' 才是正式打包
      if (process.argv[2] !== 'build')
        return

      const platform = process.env.UNI_PLATFORM
      if (!platform?.startsWith('mp-'))
        return

      for (const folder of EXCLUDE_FOLDERS) {
        const target = path.resolve(outDir, folder)
        if (!fs.existsSync(target))
          continue

        fs.rmSync(target, { recursive: true, force: true })
        console.log(`[exclude-static-folders] 已移除打包产物目录: ${folder}`)
      }
    },
  }
}
