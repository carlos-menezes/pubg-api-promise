import axios from 'axios';

interface IHeaders {
  [key: string]: any;
}

export class PUBG {
  public apiKey: string;
  public apiEndpoint: string;
  public platform: string;

  constructor(apiKey: string, platform: string) {
    this.apiKey = apiKey;
    this.platform = platform;
    this.apiEndpoint = `https://api.pubg.com/shards/${this.platform}`;
  }

  /**
   * 	This function returns information about a (list of) player(s) and a list of their recent matches (up to 14 days old).
   * Note: player objects are specific to platform shards.
   * @see [PUBG API Players Endpoint](https://documentation.pubg.com/en/players-endpoint.html)
   *
   * @example
   * PUBG.getPlayersInfo('playerNames', ['shroud', 'cytandhyw00'])
   *
   * @param filter Either `playersIds` or `playerNames` must be specified, but they cannot be used at the same time.
   * @param players An array of `playerIds` or `playerNames`.
   *
   * @returns {Promise} A promise with the requested data for the indicated players.
   */
  public getPlayersInfo(filter: string, players: string[]) {
    const playersEndpoint: string = `${this.apiEndpoint}/players?filter[${filter}]=${players.join(',')}`;
    
    return axios.get(playersEndpoint, this.applyRequestOptions(true));
  }

  /**
   * Get season information for a single player. Said stats objects contain a player's aggregated stats for a game mode in the context of a season.
   * * @see [PUBG API Seasons Endpoint](https://documentation.pubg.com/en/seasons-endpoint.html)
   *
   * @param accountId The account ID to search for.
   * @param seasonId The season ID to search for. To see list of available seasons, see `getAvailableSeasons`.
   *
   * @returns {Promise} A promise with the requested data for the indicated season and player.
   */
  public getSeasonStats(accountId: string, seasonId: string) {
    const seasonStatsEndpoint = `${this.apiEndpoint}/players/${accountId}/seasons/${seasonId}`;

    return axios.get(seasonStatsEndpoint, this.applyRequestOptions(true));
  }

  /**
   * The list of seasons will only be changing about once every two months when a new season is added. Applications should not be querying for the list of seasons more than once per month.
   * * @see [PUBG API Seasons Endpoint](https://documentation.pubg.com/en/seasons-endpoint.html)
   *
   * @returns {Promise} A promise with the data for every available season.
   */
  public getAvailableSeasons() {
    const seasonsEndpoint: string = `${this.apiEndpoint}/seasons`;

    return axios.get(seasonsEndpoint, this.applyRequestOptions(false));
  }

  /**
   * Get information for a single match.
   * @see [PUBG API Matches Endpoint](https://documentation.pubg.com/en/matches-endpoint.html#/Matches/get_matches__id_)
   *
   * @param matchId The ID to search for.
   *
   * @returns {Promise} A promise with the data for the specified match.
   */
  public getMatchInfo(matchId: string) {
    const matchesEndpoint = `${this.apiEndpoint}/matches/${matchId}`;

    return axios.get(matchesEndpoint, this.applyRequestOptions(true));
  }

  /**
   * Leaderboard stats are only available for PC players. Leaderboards are updated every 2 hours.
   * @see [PUBG API Leaderboards Endpoint](https://documentation.pubg.com/en/leaderboards-endpoint.html)
   *
   * @param gamemode The game mode to search for. Options: `solo`, `duo`, `squad`, `solo-fpp`, `duo-fpp` and `squad-fpp`.
   * @param page The leaderboard page to search for. Options: `0` or `1`.
   *
   * @returns {Promise} A promise with the leaderboards information for the specified page.
   */
  public getLeaderboards(gamemode: string, page: number) {
    const leaderboardsEndpoint = `https://api.pubg.com/shards/steam/leaderboards/${gamemode}?page[number]=${page}`;

    return axios.get(leaderboardsEndpoint, this.applyRequestOptions(true));
  }

  /**
   * Get the list of available tournaments.
   * @see [PUBG API Tournaments Endpoint](https://documentation.pubg.com/en/tournaments-endpoint.html#/)
   *
   * @returns {Promise} A promise containing the list of available tournaments.
   */
  public getAvailableTournaments() {
    return axios.get('https://api.pubg.com/tournaments', this.applyRequestOptions(true));
  }

  /**
   * Get information for a single tournament.
   * @see [PUBG API Tournaments Endpoint](https://documentation.pubg.com/en/tournaments-endpoint.html#/)
   *
   * @param tournamentId The ID to search for.
   *
   * @returns {Promise} A promise containing the information about the specified tournament.
   */
  public getTournamentInfo(tournamentId: string) {
    const tournamentEndpoint = `https://api.pubg.com/tournaments/${tournamentId}`;

    return axios.get(tournamentEndpoint, this.applyRequestOptions(true));
  }

  /**
   * Telemetry provides further insight into a match. This is where you will find the [Telemetry Events](https://documentation.pubg.com/en/telemetry-events.html#telemetry-events) that occur throughout the match.
   * @see [PUBG API Telemetry](https://documentation.pubg.com/en/telemetry.html)
   * @see [PUBG API Telemetry Events](https://documentation.pubg.com/en/telemetry-events.html)
   * @see [PUBG API Telemetry Objects](https://documentation.pubg.com/en/telemetry-objects.html)
   *
   * @param matchId The match ID to get the telemetry data for.
   *
   * @returns {Promise} A promise containing the telemetry data for the specified match.
   */
  public getTelemetryForMatch(matchId: string) {
    this.getMatchInfo(matchId).then(matchInfo => {
      const telemetryURL: string = matchInfo.data.data.included.filter(e => e.type === 'asset')[0].attributes.URL;
      return axios.get(telemetryURL, this.applyRequestOptions(false));
    });
  }

  /**
   * The status endpoint can be called to verify that the API is up and running. It also provides the most recent release date and version of the API service itself.
   * @see [PUBG API Status](https://documentation.pubg.com/en/status-endpoint.html#/Status/get_status)
   *
   * @returns {Promise} A promise containing the status of the PUBG API.
   */
  public getAPIStatus() {
    return axios.get('https://api.pubg.com/status', this.applyRequestOptions(false));
  }

  /**
   *
   * @param authorization Wether the endpoint requires authorization (use of the API key) or not.
   *
   * @returns {Object} Request options object.
   */
  private applyRequestOptions(authorization: boolean) {
    const headers: IHeaders = {
      Accept: 'application/vnd.api+json',
    };

    if (authorization) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    return { headers };
  }
}
