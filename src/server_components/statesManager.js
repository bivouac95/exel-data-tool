import InitialDataState from "./InitialDataState";
import SearchState from "./SearchState";
import ReportsStete from "./ReportsStete";

export async function getInitialDataState() {
  await InitialDataState.loadSQLData();
  return InitialDataState;
}

export async function getSearchState() {
  return SearchState;
}

export async function getReportsState() {
  return ReportsStete;
}
