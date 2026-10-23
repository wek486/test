// 无副作用的展示工具，可独立测试与替换。
export function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : ''
}
export const roleLabel = (role) =>
  ({ user: '社区成员', artist: '认证画师', admin: '管理员' })[role] || '访客'
export function safeReturnPath(path) {
  return typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('\\') &&
    !/^\/(login|register)([/?#]|$)/.test(path)
    ? path
    : '/'
}
