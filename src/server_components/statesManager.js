import InitialDataState from "./InitialDataState";
import SearchState from "./SearchState";
import ReportsStete from "./ReportsStete";

export async function getInitialDataState() {
  await InitialDataState.loadSQLData();
  return InitialDataState;
}

export async function getSearchState() {
  await InitialDataState.loadSQLData();
  await SearchState.loadSQLData();
  return SearchState;
}

export async function getReportsState() {
  return ReportsStete;
}
