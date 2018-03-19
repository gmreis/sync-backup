class Env {
  /**
     * Application context.
     *
     * @default 'development'
     * @return {String}
     */
  static get NODE_ENV() {
    return (process.env.NODE_ENV || 'development');
  }

  /**
     * Application port.
     *
     * @default 3000
     * @return {Number}
     */
  static get PORT() {
    return process.env.PORT ? Number(process.env.PORT) : 3000;
  }

  /**
   * Asana api key.
   *
   * @default 'undefined'
   * @return {String}
   */
  static get API_KEY() {
    return process.env.API_KEY || undefined;
  }

  /**
     * Asana workspace.
     *
     * @default 'undefined'
     * @return {String}
     */
  static get WORKSPACE() {
    return process.env.WORKSPACE || undefined;
  }
}

module.exports = Env;
