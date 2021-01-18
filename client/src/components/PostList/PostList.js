import React, {useCallback, useState} from 'react';
import ThumbUp from '@material-ui/icons/ThumbUp';

import useGetPostListQuery from '../../hooks/useGetPostListQuery';
import usePostUpvoteMutation from '../../hooks/usePostUpvoteMutation';
import useCreatePostMutation from '../../hooks/useCreatePostMutation';
import Styled from './styled-components';
import {gql} from "apollo-boost";
import {useSubscription} from "@apollo/react-hooks";


const POST_ADDED_SUBSCRIPTION = gql`
    subscription PostAddedSubscription {
        postAdded {
            id
            title
        }
    }
`;

const PostList = () => {
    const {
        loading,
        error,
        data,
        refetch: postListQueryRefetch,
    } = useGetPostListQuery();

    const {data: data2, loading: loading2} = useSubscription(
        POST_ADDED_SUBSCRIPTION
    );

    const listener = useCallback(() => {
        if (!loading2 && data2?.postAdded?.title) {
            window.alert(`New post added ${data2?.postAdded.title}`)
        }
    }, [data2?.postAdded.title])

    listener()

    const [postUpvote] = usePostUpvoteMutation(
        {
            onCompleted: () => {
                postListQueryRefetch();
            },
        }
    );
    const [createPost] = useCreatePostMutation(
        {
            onCompleted: () => {
                postListQueryRefetch();
            },
        }
    );
    const [title, setTitle] = useState('');
    const [votes, setVotes] = useState('');
    const [authorName, setAuthorName] = useState('');

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;

    const {post} = data;

    const upVote = (postId) => {
        postUpvote({variables: {id: postId}});
    }


    const handleSubmit = (formEvent) => {
        formEvent.preventDefault();
        createPost({variables: {title, votes: parseInt(votes), authorName}});

    }

    return (
        <>
            <Styled.Container>
                {post.map(post => (
                    <Styled.Post key={post.id}>
                        <Styled.PostTitle>{post.title}</Styled.PostTitle>
                        <Styled.Author>
                            {post.author.map(author => (
                                <Styled.AuthorItem key={author.id}>{author.name}</Styled.AuthorItem>
                            ))}
                        </Styled.Author>
                        <Styled.PostVotes>Votes: {post.votes}</Styled.PostVotes>
                        <Styled.LikeButton color="primary" onClick={() => upVote(post.id)}>
                            <ThumbUp/>
                        </Styled.LikeButton>
                    </Styled.Post>
                ))}
            </Styled.Container>

            <form onSubmit={handleSubmit}>
                <label>
                    title:
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </label>
                <label>
                    votes:
                    <input
                        type="text"
                        value={votes}
                        onChange={e => setVotes(e.target.value)}
                    />
                </label>
                <label>
                    author:
                    <input
                        type="text"
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                    />
                </label>
                <input type="submit" value="Submit"/>
            </form>
        </>
    );
};

export default PostList;
