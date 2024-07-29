import * as Types from '../types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MediaKitPage_MediaKitQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.MediaKitPage_Filter>;
  sort?: Types.InputMaybe<Array<Types.InputMaybe<Types.Scalars['String']>> | Types.InputMaybe<Types.Scalars['String']>>;
  limit?: Types.InputMaybe<Types.Scalars['Int']>;
  offset?: Types.InputMaybe<Types.Scalars['Int']>;
  page?: Types.InputMaybe<Types.Scalars['Int']>;
  search?: Types.InputMaybe<Types.Scalars['String']>;
  filter1?: Types.InputMaybe<Types.MediaKit_Filter>;
  sort1?: Types.InputMaybe<
    Array<Types.InputMaybe<Types.Scalars['String']>> | Types.InputMaybe<Types.Scalars['String']>
  >;
  limit1?: Types.InputMaybe<Types.Scalars['Int']>;
  offset1?: Types.InputMaybe<Types.Scalars['Int']>;
  page1?: Types.InputMaybe<Types.Scalars['Int']>;
  search1?: Types.InputMaybe<Types.Scalars['String']>;
  filter2?: Types.InputMaybe<Types.MediaKitPage_MediaKit_Filter>;
  sort2?: Types.InputMaybe<
    Array<Types.InputMaybe<Types.Scalars['String']>> | Types.InputMaybe<Types.Scalars['String']>
  >;
  limit2?: Types.InputMaybe<Types.Scalars['Int']>;
  offset2?: Types.InputMaybe<Types.Scalars['Int']>;
  page2?: Types.InputMaybe<Types.Scalars['Int']>;
  search2?: Types.InputMaybe<Types.Scalars['String']>;
  filter3?: Types.InputMaybe<Types.MediaKitPage_Filter>;
  sort3?: Types.InputMaybe<
    Array<Types.InputMaybe<Types.Scalars['String']>> | Types.InputMaybe<Types.Scalars['String']>
  >;
  limit3?: Types.InputMaybe<Types.Scalars['Int']>;
  offset3?: Types.InputMaybe<Types.Scalars['Int']>;
  page3?: Types.InputMaybe<Types.Scalars['Int']>;
  search3?: Types.InputMaybe<Types.Scalars['String']>;
  filter4?: Types.InputMaybe<Types.MediaKit_Filter>;
  sort4?: Types.InputMaybe<
    Array<Types.InputMaybe<Types.Scalars['String']>> | Types.InputMaybe<Types.Scalars['String']>
  >;
  limit4?: Types.InputMaybe<Types.Scalars['Int']>;
  offset4?: Types.InputMaybe<Types.Scalars['Int']>;
  page4?: Types.InputMaybe<Types.Scalars['Int']>;
  search4?: Types.InputMaybe<Types.Scalars['String']>;
  filter5?: Types.InputMaybe<Types.MediaKitPage_MediaKit_Filter>;
  sort5?: Types.InputMaybe<
    Array<Types.InputMaybe<Types.Scalars['String']>> | Types.InputMaybe<Types.Scalars['String']>
  >;
  limit5?: Types.InputMaybe<Types.Scalars['Int']>;
  offset5?: Types.InputMaybe<Types.Scalars['Int']>;
  page5?: Types.InputMaybe<Types.Scalars['Int']>;
  search5?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type MediaKitPage_MediaKitQuery = {
  __typename?: 'Query';
  mediaKitPage_mediaKit: Array<{
    __typename?: 'mediaKitPage_mediaKit';
    id: string;
    mediaKitPage_id?: {
      __typename?: 'mediaKitPage';
      allMediaKitZip?: string | null;
      boilerplateContent?: string | null;
      boilerplateTitle?: string | null;
      content: string;
      date_created?: any | null;
      date_updated?: any | null;
      id: string;
      mediaKitDescription?: string | null;
      status?: string | null;
      title: string;
      user_created?: string | null;
      user_updated?: string | null;
      date_created_func?: {
        __typename?: 'datetime_functions';
        year?: number | null;
        month?: number | null;
        week?: number | null;
        day?: number | null;
        weekday?: number | null;
        hour?: number | null;
        minute?: number | null;
        second?: number | null;
      } | null;
      date_updated_func?: {
        __typename?: 'datetime_functions';
        year?: number | null;
        month?: number | null;
        week?: number | null;
        day?: number | null;
        weekday?: number | null;
        hour?: number | null;
        minute?: number | null;
        second?: number | null;
      } | null;
      mediaKitList?: Array<{
        __typename?: 'mediaKitPage_mediaKit';
        id: string;
        mediaKitPage_id?: {
          __typename?: 'mediaKitPage';
          allMediaKitZip?: string | null;
          boilerplateContent?: string | null;
          boilerplateTitle?: string | null;
          content: string;
          date_created?: any | null;
          date_updated?: any | null;
          id: string;
          mediaKitDescription?: string | null;
          status?: string | null;
          title: string;
          user_created?: string | null;
          user_updated?: string | null;
          mediaKitList_func?: { __typename?: 'count_functions'; count?: number | null } | null;
        } | null;
        mediaKit_id?: {
          __typename?: 'mediaKit';
          backgroundColor?: string | null;
          date_created?: any | null;
          date_updated?: any | null;
          id: string;
          index?: number | null;
          name: string;
          png?: string | null;
          sort?: number | null;
          status?: string | null;
          svg?: string | null;
          user_created?: string | null;
          user_updated?: string | null;
          date_created_func?: {
            __typename?: 'datetime_functions';
            year?: number | null;
            month?: number | null;
            week?: number | null;
            day?: number | null;
            weekday?: number | null;
            hour?: number | null;
            minute?: number | null;
            second?: number | null;
          } | null;
          date_updated_func?: {
            __typename?: 'datetime_functions';
            year?: number | null;
            month?: number | null;
            week?: number | null;
            day?: number | null;
            weekday?: number | null;
            hour?: number | null;
            minute?: number | null;
            second?: number | null;
          } | null;
        } | null;
      } | null> | null;
    } | null;
    mediaKit_id?: {
      __typename?: 'mediaKit';
      backgroundColor?: string | null;
      date_created?: any | null;
      date_updated?: any | null;
      id: string;
      index?: number | null;
      name: string;
      png?: string | null;
      sort?: number | null;
      status?: string | null;
      svg?: string | null;
      user_created?: string | null;
      user_updated?: string | null;
    } | null;
  }>;
};

export const MediaKitPage_MediaKitDocument = gql`
  query mediaKitPage_mediaKit(
    $filter: mediaKitPage_filter
    $sort: [String]
    $limit: Int
    $offset: Int
    $page: Int
    $search: String
    $filter1: mediaKit_filter
    $sort1: [String]
    $limit1: Int
    $offset1: Int
    $page1: Int
    $search1: String
    $filter2: mediaKitPage_mediaKit_filter
    $sort2: [String]
    $limit2: Int
    $offset2: Int
    $page2: Int
    $search2: String
    $filter3: mediaKitPage_filter
    $sort3: [String]
    $limit3: Int
    $offset3: Int
    $page3: Int
    $search3: String
    $filter4: mediaKit_filter
    $sort4: [String]
    $limit4: Int
    $offset4: Int
    $page4: Int
    $search4: String
    $filter5: mediaKitPage_mediaKit_filter
    $sort5: [String]
    $limit5: Int
    $offset5: Int
    $page5: Int
    $search5: String
  ) {
    mediaKitPage_mediaKit(
      filter: $filter5
      sort: $sort5
      limit: $limit5
      offset: $offset5
      page: $page5
      search: $search5
    ) {
      id
      mediaKitPage_id(
        filter: $filter3
        sort: $sort3
        limit: $limit3
        offset: $offset3
        page: $page3
        search: $search3
      ) {
        allMediaKitZip
        boilerplateContent
        boilerplateTitle
        content
        date_created
        date_created_func {
          year
          month
          week
          day
          weekday
          hour
          minute
          second
        }
        date_updated
        date_updated_func {
          year
          month
          week
          day
          weekday
          hour
          minute
          second
        }
        id
        mediaKitDescription
        status
        title
        user_created
        user_updated
        mediaKitList(filter: $filter2, sort: $sort2, limit: $limit2, offset: $offset2, page: $page2, search: $search2) {
          id
          mediaKitPage_id(filter: $filter, sort: $sort, limit: $limit, offset: $offset, page: $page, search: $search) {
            allMediaKitZip
            boilerplateContent
            boilerplateTitle
            content
            date_created
            date_updated
            id
            mediaKitDescription
            status
            title
            user_created
            user_updated
            mediaKitList_func {
              count
            }
          }
          mediaKit_id(
            filter: $filter1
            sort: $sort1
            limit: $limit1
            offset: $offset1
            page: $page1
            search: $search1
          ) {
            backgroundColor
            date_created
            date_created_func {
              year
              month
              week
              day
              weekday
              hour
              minute
              second
            }
            date_updated
            date_updated_func {
              year
              month
              week
              day
              weekday
              hour
              minute
              second
            }
            id
            index
            name
            png
            sort
            status
            svg
            user_created
            user_updated
          }
        }
      }
      mediaKit_id(filter: $filter4, sort: $sort4, limit: $limit4, offset: $offset4, page: $page4, search: $search4) {
        backgroundColor
        date_created
        date_updated
        id
        index
        name
        png
        sort
        status
        svg
        user_created
        user_updated
      }
    }
  }
`;

/**
 * __useMediaKitPage_MediaKitQuery__
 *
 * To run a query within a React component, call `useMediaKitPage_MediaKitQuery` and pass it any options that fit your needs.
 * When your component renders, `useMediaKitPage_MediaKitQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMediaKitPage_MediaKitQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      sort: // value for 'sort'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      page: // value for 'page'
 *      search: // value for 'search'
 *      filter1: // value for 'filter1'
 *      sort1: // value for 'sort1'
 *      limit1: // value for 'limit1'
 *      offset1: // value for 'offset1'
 *      page1: // value for 'page1'
 *      search1: // value for 'search1'
 *      filter2: // value for 'filter2'
 *      sort2: // value for 'sort2'
 *      limit2: // value for 'limit2'
 *      offset2: // value for 'offset2'
 *      page2: // value for 'page2'
 *      search2: // value for 'search2'
 *      filter3: // value for 'filter3'
 *      sort3: // value for 'sort3'
 *      limit3: // value for 'limit3'
 *      offset3: // value for 'offset3'
 *      page3: // value for 'page3'
 *      search3: // value for 'search3'
 *      filter4: // value for 'filter4'
 *      sort4: // value for 'sort4'
 *      limit4: // value for 'limit4'
 *      offset4: // value for 'offset4'
 *      page4: // value for 'page4'
 *      search4: // value for 'search4'
 *      filter5: // value for 'filter5'
 *      sort5: // value for 'sort5'
 *      limit5: // value for 'limit5'
 *      offset5: // value for 'offset5'
 *      page5: // value for 'page5'
 *      search5: // value for 'search5'
 *   },
 * });
 */
export function useMediaKitPage_MediaKitQuery(
  baseOptions?: Apollo.QueryHookOptions<MediaKitPage_MediaKitQuery, MediaKitPage_MediaKitQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MediaKitPage_MediaKitQuery, MediaKitPage_MediaKitQueryVariables>(
    MediaKitPage_MediaKitDocument,
    options,
  );
}
export function useMediaKitPage_MediaKitLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MediaKitPage_MediaKitQuery, MediaKitPage_MediaKitQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MediaKitPage_MediaKitQuery, MediaKitPage_MediaKitQueryVariables>(
    MediaKitPage_MediaKitDocument,
    options,
  );
}
export type MediaKitPage_MediaKitQueryHookResult = ReturnType<typeof useMediaKitPage_MediaKitQuery>;
export type MediaKitPage_MediaKitLazyQueryHookResult = ReturnType<typeof useMediaKitPage_MediaKitLazyQuery>;
export type MediaKitPage_MediaKitQueryResult = Apollo.QueryResult<
  MediaKitPage_MediaKitQuery,
  MediaKitPage_MediaKitQueryVariables
>;
