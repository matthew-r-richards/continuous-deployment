export default function (module) {
    delete require.cache[require.resolve(module)]
    return require(module)
}