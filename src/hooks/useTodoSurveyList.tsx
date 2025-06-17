import {useCallback, useRef, useState} from 'react';
import {SurveyItem} from '../types/SurveyTypes';
import {useSelector} from 'react-redux';
import {OrderResponseModel} from '../models/OrderModel';
import {getSurveyList} from '../services/foodService';
import {NavigatorNames} from '../navigators/tabs/NavigatorsNames';
import {navigate} from '../navigators/utils/Utils';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import { getOrders } from '../services/orderService';

const useTodoSurveyList = () => {
  const todoPage = useRef(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [todoLoading, setTodoLoading] = useState(false);
  const [refreshingTodo, setRefreshingTodo] = useState(false);
  const [surveyTodoList, setSurveyTodoList] = useState<SurveyItem[]>([]);
  const orderResponse: OrderResponseModel | null = useSelector(
    (state: any) => state.order.orderResponse,
  );
  const [overDueIndex, setOverDueIndex] = useState(-1);
  const [todoIndex, setTodoIndex] = useState(-1);

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        fetchSurveyList(1);
        todoPage.current = 1;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const fetchSurveyList = async (pageNum: number) => {
    setTodoLoading(true);
    try {
      const response = await getOrders();
      const orderId = response?.order?.id;
      if (orderId) {
        const response = await getSurveyList(pageNum, 10, orderId, 'PENDING');
        setHasNextPage(response.hasNextPage);
        const list = await response?.data;
        const today = new Date();
        let hasOverdue = false;
        let hasTodo = false;
        if (pageNum === 1) {
          setOverDueIndex(-1);
          setTodoIndex(-1);
        }

        // Process the response and categorize items
        list.forEach((item: SurveyItem, index: number) => {
          const itemDate = new Date(item.endDate);
          if (itemDate < today) {
            if (!hasOverdue) {
              setOverDueIndex(index);
              hasOverdue = true;
            }
          } else {
            if (!hasTodo && hasOverdue) {
              setTodoIndex(index);
              hasTodo = true;
            }
          }
        });

        if (pageNum === 1) {
          setSurveyTodoList(list);
        } else {
          setSurveyTodoList(pre => [...pre, ...list]);
        }
      }
    } catch (error) {
    } finally {
      setTodoLoading(false);
      setRefreshingTodo(false);
    }
  };

  const refreshTodoList = async () => {
    setRefreshingTodo(true);
    await fetchSurveyList(1);
    todoPage.current = 1;
  };

  const loadMoreTodoList = async () => {
    if (hasNextPage && !todoLoading) {
      await fetchSurveyList(todoPage.current + 1);
      todoPage.current += 1;
    }
  };

  const navigateToSurvey = (item: SurveyItem) => {
    const orderId = orderResponse?.order?.id;
    const link = `${item.link}?source=${orderId},${item.metadataId},${item.assessmentId},${item.id}`;
    navigate(NavigatorNames.surveyWebView, {surveyUrl: link});
  };

  return {
    todoPage,
    hasNextPage,
    setHasNextPage,
    todoLoading,
    setTodoLoading,
    refreshingTodo,
    setRefreshingTodo,
    surveyTodoList,
    setSurveyTodoList,
    refreshTodoList,
    loadMoreTodoList,
    navigateToSurvey,
    overDueIndex,
    todoIndex,
  };
};

export default useTodoSurveyList;
