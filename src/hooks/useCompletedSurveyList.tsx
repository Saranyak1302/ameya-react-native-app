import {useCallback, useRef, useState} from 'react';
import {SurveyItem} from '../types/SurveyTypes';
import {useSelector} from 'react-redux';
import {OrderResponseModel} from '../models/OrderModel';
import {getSurveyList} from '../services/foodService';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';
import { getOrders } from '../services/orderService';

const useCompletedSurveyList = () => {
  const completePage = useRef(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [refreshingComplete, setRefreshingComplete] = useState(false);
  const [surveyCompletedList, setSurveyCompletedList] = useState<SurveyItem[]>(
    [],
  );
  const orderResponse: OrderResponseModel | null = useSelector(
    (state: any) => state.order.orderResponse,
  );

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        fetchSurveyList(1);
        completePage.current = 1;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const fetchSurveyList = async (pageNum: number) => {
    setCompleteLoading(true);
    try {
      const response = await getOrders();
      const orderId = response?.order?.id;
      if (orderId) {
        const response = await getSurveyList(pageNum, 10, orderId, 'COMPLETED');
        setHasNextPage(response.hasNextPage);
        const list = await response?.data;
        if (pageNum === 1) {
          setSurveyCompletedList(list);
        } else {
          setSurveyCompletedList(pre => [...pre, ...list]);
        }
      }
    } catch (error) {
    } finally {
      setCompleteLoading(false);
      setRefreshingComplete(false);
    }
  };

  const refreshCompletedList = async () => {
    setRefreshingComplete(true);
    await fetchSurveyList(1);
    completePage.current = 1;
  };

  const loadMoreCompletedList = async () => {
    if (hasNextPage && !completeLoading) {
      await fetchSurveyList(completePage.current + 1);
      completePage.current += 1;
    }
  };

  return {
    completePage,
    hasNextPage,
    setHasNextPage,
    completeLoading,
    setCompleteLoading,
    refreshingComplete,
    setRefreshingComplete,
    surveyCompletedList,
    setSurveyCompletedList,
    refreshCompletedList,
    loadMoreCompletedList,
  };
};

export default useCompletedSurveyList;
