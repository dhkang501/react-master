import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import {Helmet} from "react-helmet";
import { Switch, Route, useParams, useLocation, useRouteMatch } from "react-router-dom";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { fetchCoinInfo, fetchCoinTickers } from "../api";
import Chart from "./Chart";
import Price from "./Price";

interface RouteParams {
    coinId: string;
}
interface RouteState {
    name: string;
}

interface InfoData {
    id: string;
    name: string;
    symbol: string;
    rank: number;
    is_new: boolean;
    is_active: boolean;
    type: string;
    logo: string;
    description: string;
    message: string;
    open_source: boolean;
    started_at: string;
    development_status: string;
    hardware_wallet: boolean;
    proof_type: string;
    org_structure: string;
    hash_algorithm: string;
    first_data_at: string;
    last_data_at: string;
}

interface PriceData {
    id: string;
    name: string;
    symbol: string;
    rank: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    beta_value: number;
    first_data_at: string;
    last_updated: string;
    quotes: {
        USD: {
            ath_date: string;
            ath_price: number;
            market_cap: number;
            market_cap_change_24h: number;
            percent_change_1h: number;
            percent_change_1y: number;
            percent_change_6h: number;
            percent_change_7d: number;
            percent_change_12h: number;
            percent_change_15m: number;
            percent_change_24h: number;
            percent_change_30d: number;
            percent_change_30m: number;
            percent_from_price_ath: number;
            price: number;
            volume_24h: number;
            volume_24h_change_24h: number;
          };
    }
}

function Coin() {
    const Tabs = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 25px 0px;
    gap: 10px;
    `;

    const Tab = styled.span<{ isActive: boolean }>`
    text-align: center;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 400;
    background-color: rgba(0, 0, 0, 0.5);
    /* padding: 7px 0px; */
    border-radius: 10px;
    color: ${(props) => (props.isActive ? props.theme.accentColor : props.theme.textColor)};
    
    a {
        padding: 7px 0px;
        display: block;
    }
    `;

    const Container = styled.div`
        padding: 0px 20px;
        max-width: 480px;
        margin: 0 auto;
    `;

    const Header = styled.header`
        height: 10vh;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const Title = styled.h1`
        font-size: 48px;
        align-items: center;
        /* color: ${props => props.theme.accentColor}; */
    `;

    const Overview = styled.div`
        display: flex;
        justify-content: space-between;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 10px 20px;
        border-radius: 10px;
    `;
    const OverviewItem = styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 33%;
        span:first-child {
            font-size: 10px;
            font-weight: 400;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
    `;
    const Description = styled.p`
        margin: 20px 0px;
    `;

    const Loader = styled.span`
        text-align: center;
        display: block;
    `;
    
    //useParams: url 파라미터 받아와서 사용
    const {coinId} = useParams<RouteParams>();
    //useLocation: 현재 url 정보 가져오기
    const { state } = useLocation<RouteState>();
    const priceMatch = useRouteMatch("/:coinId/price");
    const chartMatch = useRouteMatch("/:coinId/chart");
    const { isLoading: infoLoading, data: infoData } = useQuery<InfoData>(
        ["info", coinId],
        () => fetchCoinInfo(coinId)
    );
        
    const { isLoading: tickersLoading, data: tickersData } = useQuery<PriceData>(
        ["tickers", coinId],
        () => fetchCoinTickers(coinId),
        {
            refetchInterval: 5000, //query를 5초마다 refetch 
        }
    );
        
    const loading = infoLoading || tickersLoading;

    return (
        <Container>
        <Helmet>
            <title>{state?.name ? state.name : loading ? "Loading..." : infoData?.name}</title>
        </Helmet>
        <Header>
            <Title>
                {/* url에서 바로 접근 할 경우 에러 수정위해 state?.name 물음표 붙여줌 
                state?.name ? state.name 홈페이지에 와서 coin을 클릭할 때만 이게 true가 되면서 name을 화면에 렌더링
                loading 중이라면 Loading... 을 보여줌
                loading 중이 아니라면 api로 부터 받아온 name을 보여줌
                */}
                {state?.name ? state.name : loading ? "Loading..." : infoData?.name}
            </Title>
        </Header>
        <Link to={'/react-master'}>Home</Link>
        {loading ? (
            <Loader>Loading...</Loader>
        ) : (
            <>
            <Overview>
                <OverviewItem>
                    <span>Rank:</span>
                    <span>{infoData?.rank}</span>
                </OverviewItem>
                <OverviewItem>
                    <span>Symbol:</span>
                    <span>${infoData?.symbol}</span>
                </OverviewItem>
                <OverviewItem>
                    <span>Price:</span>
                    <span>{tickersData?.quotes.USD.price.toFixed(3)}</span>
                </OverviewItem>
            </Overview>
            <Description>{infoData?.description}</Description>
            <Overview>
                <OverviewItem>
                    <span>Total Supply:</span>
                    <span>{tickersData?.total_supply}</span>
                </OverviewItem>
                <OverviewItem>
                    <span>Max Supply:</span>
                    <span>{tickersData?.max_supply}</span>
                </OverviewItem>
            </Overview>
            <Tabs>
                <Tab isActive={chartMatch !== null}>
                    <Link to={`/${coinId}/chart`}>Chart</Link>
                </Tab>
                <Tab isActive={priceMatch !== null}>
                    <Link to={`/${coinId}/price`}>Price</Link>
                </Tab>
            </Tabs>
            <Switch>
                <Route path={`/:coinId/price`}>
                    <Price coinId={coinId}/>
                </Route>
                <Route path={`/:coinId/chart`}>
                    <Chart coinId={coinId}/>
                </Route>
            </Switch>
            </>
        )}
        </Container>
    );
}
export default Coin;