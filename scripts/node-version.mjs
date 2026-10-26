export const NODE_RANGE = '^22.13.0 || ^24.0.0 || >=26.0.0';

export function diagnoseNodeVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:\+[\w.-]+)?$/.exec(version);
  const major = match ? Number(match[1]) : NaN;
  const minor = match ? Number(match[2]) : NaN;
  const supported = !!match && ((major === 22 && minor >= 13) || major === 24 || major >= 26);
  return {
    supported,
    message: `Node.js ${version}（支持范围：${NODE_RANGE}；推荐 Node.js 24 LTS）${supported ? '' : '：当前版本不受支持，请切换版本后重试。'}`,
  };
}
